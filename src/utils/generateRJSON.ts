import { r, rtp, RT, migrations, en, createRecord, rn, RecordNode, vn } from '@gmetrixr/rjson'
import axios from 'axios';
import { createWordSearch } from './wordSearch';
// import { JSONParams } from './types/jsonParams';
import { ProjectFactory } from '@gmetrixr/rjson/lib/cjs/r/recordFactories';
import { WordSearchParams } from '../types';
import { updateProject } from './utils';

// --------- GLOABALS ------------
const defaultParams: WordSearchParams = {
  colors: {
    base: "#0C4494",
    intermediate: "#F8E71C",
    top: "#AFE1AF",
    text: ""
  },
  font: {
    fontSize: 1
  },
  translate: {
    yCoord: 0,
    zCoord: -30,
    horizontalSpacing: 0.5,
    verticalSpacing: 0.5,
  },
  dimensions: {
    width: 1.5,
    height: 1.5,
  }
}

const allWordsElements = {
  greenElements: {},
  yellowAndBlueElements: {
    blueElements: {},
    yellowElements: {}
  },
};

const toHide = [];
const wordVariableMap = {};

const addVarRules = (scene360, words: string[]) => {
  // this function adds all the rules to the scene
  const sceneF = r.scene(scene360);

  // // add variable increment rules 
  // words.forEach((word: string): void => {
  //   const rule = createRecord(RT.rule);
  //   rule.name = `increment_var_${word.toLowerCase()}`;
  //   const ruleF = r.record(rule);

  //   const blueVar = allWordsElements.yellowAndBlueElements.blueElements[word.toUpperCase()];
  //   const whenEvent1 = createRecord(RT.when_event);
  //   const whenEvent1F = r.record(whenEvent1);
  //   whenEvent1F.set(rtp.when_event.event, rn.RuleEvent.on_click);
  //   whenEvent1F.set(rtp.when_event.co_id, blueVar?.id);
  //   whenEvent1F.set(rtp.when_event.co_type, blueVar?.props?.element_type);
  //   ruleF.addRecord(whenEvent1);

  //   const flagVar = wordVariableMap[word.toLowerCase()];
  //   const whenEvent2 = createRecord(RT.when_event);
  //   const whenEvent2F = r.record(whenEvent2);


  // });

  console.log('allWordsElements: ', allWordsElements)

  words.forEach((word: string): void => {
    const variable = wordVariableMap[word.toLowerCase()];
    // creating a new rule for each variable
    const rule = createRecord(RT.rule);
    rule.name = `correct_word_${word.toLowerCase()}`
    const ruleF = r.record(rule);
    // defining the when event
    const whenEvent = createRecord(RT.when_event);
    const whenEventF = r.record(whenEvent);
    whenEventF.set(rtp.when_event.event, rn.RuleEvent.on_set_eq);
    whenEventF.set(rtp.when_event.co_id, variable?.id);
    whenEventF.set(rtp.when_event.co_type, variable?.props?.var_type);
    whenEventF.set(rtp.when_event.properties, [word.length]);

    // adding the when event to the rule
    ruleF.addRecord(whenEvent);

    // creating the corresponding then events
    // 1. hide all yellow and blue elements
    // 2. show the green elements for this word
    // 3. award score

    // 1. hide all yellow and blue elements
    toHide.forEach((json) => {
      const hideAction = createRecord(RT.then_action);
      const hideActionF = r.record(hideAction);
      hideActionF.set(rtp.then_action.action, rn.RuleAction.hide);
      hideActionF.set(rtp.then_action.co_id, json?.id);
      hideActionF.set(rtp.then_action.co_type, json?.props.element_type);
      ruleF.addRecord(hideAction);
    });

    // hide all the blue elements for this word as well
    const blueElements = allWordsElements.yellowAndBlueElements.blueElements[word.toUpperCase()];
    blueElements.forEach((json) => {
      const hideAction = createRecord(RT.then_action);
      const hideActionF = r.record(hideAction);
      hideActionF.set(rtp.then_action.action, rn.RuleAction.hide);
      hideActionF.set(rtp.then_action.co_id, json?.id);
      hideActionF.set(rtp.then_action.co_type, json?.props.element_type);
      ruleF.addRecord(hideAction);
    })

    // 2. show the green elements for this word
    console.log("allWordsElements in addVarRules", allWordsElements);
    console.log('word: ', word);
    const greenElements = allWordsElements.greenElements[word.toUpperCase()];
    console.log('greenElements', greenElements);
    greenElements.forEach((json) => {
      // const json = greenElements[letter];
      const showAction = createRecord(RT.then_action);
      const showActionF = r.record(showAction);
      showActionF.set(rtp.then_action.action, rn.RuleAction.show);
      showActionF.set(rtp.then_action.co_id, json?.id);
      showActionF.set(rtp.then_action.co_type, json?.props.element_type);
      ruleF.addRecord(showAction);
    })

    // 3. award score
    // const thenEvent = createRecord(RT.then_action);
    // const thenEventF = r.record(thenEvent);
    // thenEventF.set(rtp.then_action.action, rn.RuleAction.award_score);
    // thenEventF.set(rtp.then_action.co_id, scoreVar?.id);
    // thenEventF.set(rtp.then_action.co_type, vn.PredefinedVariableName.score);
    // thenEventF.set(rtp.then_action.properties, [10]);
    // ruleF.addRecord(thenEvent);

    // reset the variable for this word if clicked on blue of some other word

    // adding this rule to scene
    sceneF.addRecord(rule);
  })

  // reset the correct variables in case the number is being rest 
  const nonCorrectBlueElements = allWordsElements.yellowAndBlueElements.blueElements[""];
  nonCorrectBlueElements.forEach((json) => {
    const rule = createRecord(RT.rule);
    rule.name = `reset_vars_${json?.name}`;
    const ruleF = r.record(rule);

    const whenEvent = createRecord(RT.when_event);
    const whenEventF = r.record(whenEvent);
    whenEventF.set(rtp.when_event.event, rn.RuleEvent.on_click);
    whenEventF.set(rtp.when_event.co_id, json?.id);
    whenEventF.set(rtp.when_event.co_type, json?.props.element_type);
    ruleF.addRecord(whenEvent);

    const thenEvent = createRecord(RT.then_action);
    const thenEventF = r.record(thenEvent);
    thenEventF.set(rtp.then_action.action, rn.RuleAction.set_to_number);
    thenEventF.set(rtp.then_action.co_id, json?.props?.var_id);
    thenEventF.set(rtp.then_action.co_type, json?.props?.var_type);
    thenEventF.set(rtp.then_action.properties, [0]);
    ruleF.addRecord(thenEvent);

    sceneF.addRecord(rule);
  });
}


const ifPartOfCorrectWord = (wordMap: { [key: string]: any }, rowIdx: number, colIdx: number): { isPresent: boolean, word: string } => {
  const words = Object.keys(wordMap);
  for (let i = 0; i < words.length; i++) {
    const idxs = wordMap[words[i]]['idxs'];
    for (let j = 0; j < idxs.length; j++) {
      if (idxs[j][0] === rowIdx && idxs[j][1] === colIdx) return { isPresent: true, word: words[i] };
    }
  }

  return { isPresent: false, word: "" };
}


const createOverlappingElements = (scene360: RecordNode<RT.scene>, projectF: ProjectFactory, coordinates: WordSearchParams, letter: string,
  word: string, isCorrectWord = false, groupElementJSON = null, correctWordVariable = null) => {

  const { xCoord, yCoord, zCoord } = coordinates.translate;
  const { width, height } = coordinates.dimensions;
  const { base, intermediate, top } = coordinates.colors;
  const fontSize = coordinates.font.fontSize;

  // take the pre created groupElementJSON in case the letter belongs to a correct word
  const groupElement = isCorrectWord ? groupElementJSON : projectF.addElementOfTypeToScene({
    sceneId: scene360.id,
    elementType: en.ElementType.group
  });

  if (groupElement) {
    groupElement.name = "overlapped tiles";

    const elementJSON = projectF.addElementOfTypeToScene({
      sceneId: scene360.id,
      elementType: en.ElementType.text,
      groupElementId: groupElement.id
    });

    const yellowElementJSON = projectF.addElementOfTypeToScene({
      sceneId: scene360.id,
      elementType: en.ElementType.text,
      groupElementId: groupElement.id
    });

    // adding these to global map
    if (!allWordsElements.yellowAndBlueElements.yellowElements[word]) {
      allWordsElements.yellowAndBlueElements.yellowElements[word] = [];
    }
    allWordsElements.yellowAndBlueElements.yellowElements[word].push(yellowElementJSON);
    if (!allWordsElements.yellowAndBlueElements.blueElements[word]) {
      allWordsElements.yellowAndBlueElements.blueElements[word] = [];
    }
    allWordsElements.yellowAndBlueElements.blueElements[word].push(elementJSON);

    toHide.push(yellowElementJSON);

    let greenElementJSON = null;
    if (isCorrectWord) {
      greenElementJSON = projectF.addElementOfTypeToScene({
        sceneId: scene360.id,
        elementType: en.ElementType.text,
        groupElementId: groupElement.id
      });

      if (!allWordsElements.greenElements[word]) {
        allWordsElements.greenElements[word] = [];
      }
      allWordsElements.greenElements[word].push(greenElementJSON);
    }

    console.log('tohIDE: ', toHide);
    console.log('allWordsElements: ', allWordsElements);


    // const elementJSON = sceneF. (RT.element);

    if (elementJSON && yellowElementJSON) {
      // element factory
      // const xPosn = (idx > 0 ? (xCoord += horizontalSpacing + width) : xCoord);
      const yellowF = r.element(yellowElementJSON);
      yellowElementJSON.name = `yellow_${word}_${letter}`;
      yellowF.set(rtp.element.text, letter);
      yellowF.set(rtp.element.wh, [width, height]);
      yellowF.set(rtp.element.placer_3d, [
        xCoord,
        yCoord,
        zCoord,
        0, 0, 0, 1, 1, 1]);
      yellowF.set(rtp.element.font_size, (fontSize ?? 1.0));
      // yellowF.set(rtp.element.radius, 0.7);
      yellowF.set(rtp.element.background_color, (intermediate ?? '#F8E71C'));
      // yellowF.set(rtp.element.font_weight, 'bold');
      yellowF.set(rtp.element.border_color, '#000000');
      yellowF.set(rtp.element.border_radius, 0.7);
      yellowF.set(rtp.element.border_width, 0.1);
      yellowF.set(rtp.element.hidden, true);
      const elementF = r.element(elementJSON);
      elementJSON.name = `blue_${word}_${letter}`;
      elementF.set(rtp.element.text, letter);
      elementF.set(rtp.element.wh, [width, height]);
      elementF.set(rtp.element.placer_3d, [
        xCoord,
        yCoord,
        zCoord,
        0, 0, 0, 1, 1, 1]);
      elementF.set(rtp.element.font_size, (fontSize ?? 1.0));
      // elementF.set(rtp.element.radius, 0.7);
      elementF.set(rtp.element.background_color, (base ?? '#0C4494'));
      // elementF.set(rtp.element.font_weight, 'bold');
      elementF.set(rtp.element.border_color, '#000000');
      elementF.set(rtp.element.border_radius, 0.7);
      elementF.set(rtp.element.border_width, 0.1);

      // let greenF = null
      if (isCorrectWord && greenElementJSON) {
        greenElementJSON.name = `green_${word}_${letter}`;
        const greenF = r.element(greenElementJSON);
        greenF.set(rtp.element.text, letter);
        greenF.set(rtp.element.wh, [width, height]);
        greenF.set(rtp.element.placer_3d, [
          xCoord,
          yCoord,
          zCoord,
          0, 0, 0, 1, 1, 1]);
        greenF.set(rtp.element.font_size, 1.0);
        // greenF.set(rtp.element.radius, 0.7);
        greenF.set(rtp.element.background_color, (top ?? '#AFE1AF'));
        // greenF.set(rtp.element.font_weight, 'bold');
        greenF.set(rtp.element.border_color, '#000000');
        greenF.set(rtp.element.border_radius, 0.7);
        greenF.set(rtp.element.border_width, 0.1);
        greenF.set(rtp.element.hidden, true);
      }


      const rule = createRecord(RT.rule);
      const ruleF = r.record(rule);

      // when
      const whenEvent = createRecord(RT.when_event);
      const whenEventF = r.record(whenEvent);
      whenEventF.set(rtp.when_event.event, rn.RuleEvent.on_click);
      whenEventF.set(rtp.when_event.co_id, elementJSON?.id);
      whenEventF.set(rtp.when_event.co_type, elementJSON?.props.element_type);

      // then blue should hide at 0 sec
      // const thenAction1 = createRecord(RT.then_action);
      // const thenAction1F = r.record(thenAction1);
      // thenAction1F.set(rtp.then_action.action, rn.RuleAction.hide);
      // thenAction1F.set(rtp.then_action.co_id, elementJSON?.id);
      // thenAction1F.set(rtp.then_action.co_type, elementJSON?.props.element_type);

      // then yellow should appear at 0 sec
      let thenAction2 = null;
      let thenAction3 = null;
      if (greenElementJSON !== null) {
        // variable setting then action
        const varThenAction = createRecord(RT.then_action);
        const varThenActionF = r.record(varThenAction);
        varThenActionF.set(rtp.then_action.action, rn.RuleAction.add_number);
        varThenActionF.set(rtp.then_action.properties, [1]);
        console.log('co_id: ', correctWordVariable?.id);
        console.log('co_type: ', correctWordVariable?.type);
        varThenActionF.set(rtp.then_action.co_id, correctWordVariable?.id);
        varThenActionF.set(rtp.then_action.co_type, correctWordVariable?.props?.var_type);
        ruleF.addRecord(varThenAction);
      }

      thenAction2 = createRecord(RT.then_action);
      const thenAction2F = r.record(thenAction2);
      thenAction2F.set(rtp.then_action.action, rn.RuleAction.show);
      thenAction2F.set(rtp.then_action.co_id, yellowElementJSON?.id);
      thenAction2F.set(rtp.then_action.co_type, yellowElementJSON?.props.element_type);

      // then yellow should hide at 1 sec
      thenAction3 = createRecord(RT.then_action);
      const thenAction3F = r.record(thenAction3);
      thenAction3F.set(rtp.then_action.action, rn.RuleAction.hide);
      thenAction3F.set(rtp.then_action.co_id, yellowElementJSON?.id);
      thenAction3F.set(rtp.then_action.co_type, yellowElementJSON?.props.element_type);
      thenAction3F.set(rtp.then_action.delay, 3.0);


      ruleF.addRecord(whenEvent);
      ruleF.addRecord(thenAction2);
      ruleF.addRecord(thenAction3);
      // then actions for resetting the correct variable values
      if (!isCorrectWord) {
        Object.keys(wordVariableMap).forEach((word: string) => {
          const wordVar = wordVariableMap[word];
          // const wordVar = wordVariableMap[word].variable;
          // action to reset the variable
          const thenAction4 = createRecord(RT.then_action);
          const thenAction4F = r.record(thenAction4);
          thenAction4F.set(rtp.then_action.action, rn.RuleAction.set_to_number);
          thenAction4F.set(rtp.then_action.properties, [0]);
          thenAction4F.set(rtp.then_action.co_id, wordVar?.id);
          thenAction4F.set(rtp.then_action.co_type, wordVar?.props?.var_type);
          ruleF.addRecord(thenAction4);

          // action to reset flags
          // Object.keys(wordVariableMap[word].flags).forEach((letter: string) => {
          //   const flagVar = wordVariableMap[word].flags[letter];
          //   const thenAction5 = createRecord(RT.then_action);
          //   const thenAction5F = r.record(thenAction5);
          //   thenAction5F.set(rtp.then_action.action, rn.RuleAction.set_to_number);
          //   thenAction5F.set(rtp.then_action.properties, [0]);
          //   thenAction5F.set(rtp.then_action.co_id, flagVar?.id);
          //   thenAction5F.set(rtp.then_action.co_type, flagVar?.props?.var_type);
          //   ruleF.addRecord(thenAction5);
          // })
        })
      }
      const sceneF = r.scene(scene360);
      sceneF.addRecord(rule);
    }
  }
}

export const gen = (words: string[], gridSize: number, params: WordSearchParams = defaultParams) => {
  const { grid, wordMap } = createWordSearch(words.map((word: string) => word.toUpperCase()), gridSize);
  // printing the grid
  for (const row of grid) {
    console.log(row.join(" "));
  }
  // creating a blank project json
  const json = migrations.createNewProject();

  // 4 factories: RecordFactory (Base) -> ProjectFactory -> SceneFactory -> ElementFactory
  const projectF = r.project(json);

  const initialSceneId = projectF.getInitialSceneId();
  const scene360 = projectF.addBlankRecord(RT.scene);
  projectF.deleteRecord(RT.scene, initialSceneId);


  words.forEach((word: string) => {
    const rule = createRecord(RT.rule);

    // creating variable
    const variable = createRecord(RT.variable);
    const variableF = r.record(variable);
    variableF.set(rtp.variable.var_default, 0);
    variableF.set(rtp.variable.var_type, vn.VariableType.number);
    variableF.set(rtp.variable.var_category, vn.VarCategory.user_defined);
    variableF.set(rtp.variable.var_track, true);
    variable.name = word; // set(rtp.variable.var_name, word);
    projectF.addRecord(variable);
    wordVariableMap[word] = variable;
    // if (!wordVariableMap[word]) wordVariableMap[word] = {};
    // wordVariableMap[word]["variable"] = variable;

    // // creating flag variables
    // word.split("").forEach((letter: string) => {
    //   const flagVariable = createRecord(RT.variable);
    //   const flagVariableF = r.record(flagVariable);
    //   flagVariableF.set(rtp.variable.var_default, 0);
    //   flagVariableF.set(rtp.variable.var_type, vn.VariableType.number);
    //   flagVariableF.set(rtp.variable.var_category, vn.VarCategory.user_defined);
    //   flagVariableF.set(rtp.variable.var_track, true);
    //   flagVariable.name = `flag_${word}_${letter}`;
    //   projectF.addRecord(flagVariable);
    //   if (!wordVariableMap[word]["flags"]) wordVariableMap[word]["flags"] = {};
    //   wordVariableMap[word]["flags"][letter] = flagVariable;
    // });
  });

  // json for the scene
  // const scene = projectF.getRecord(RT.scene, initialSceneId);

  if (scene360) {
    const { translate, dimensions } = params;
    let { xCoord, yCoord } = translate;
    const { zCoord, horizontalSpacing, verticalSpacing } = translate
    const { width, height } = dimensions;
    const initialXCoord = xCoord ?? (-1) * (gridSize * width + (gridSize - 1) * horizontalSpacing) / 2;
    yCoord = (gridSize * height + (gridSize - 1) * verticalSpacing) / 2;


    projectF.addElementOfTypeToScene({ sceneId: scene360.id, elementType: en.ElementType.pano_image });

    // create groups for correct words 
    Object.keys(wordMap).forEach((word: string): void => {
      const groupJSON = projectF.addElementOfTypeToScene({
        sceneId: scene360.id,
        elementType: en.ElementType.group
      });
      if (groupJSON) {
        groupJSON.name = word;
        wordMap[word]['groupeElementJSON'] = groupJSON;
      }
    });

    grid.forEach((row: string[], rowIdx: number): void => {
      xCoord = initialXCoord;
      row.forEach((letter: string, idx: number): void => {
        // const sceneF = r.scene(scene);
        const { isPresent, word } = ifPartOfCorrectWord(wordMap, rowIdx, idx);
        if (isPresent) {
          console.log('part of correct word: ', letter, rowIdx, idx);
          console.log('word: ', word);
          console.log('wordVariableMap[word]: ', wordVariableMap[word.toLowerCase()]);
          createOverlappingElements(scene360, projectF, {
            translate: {
              xCoord: (idx > 0 ? (xCoord += horizontalSpacing + width) : xCoord),
              yCoord,
              zCoord
            },
            dimensions: {
              width, height
            },
            colors: params.colors,
            font: params.font

          }, letter, word, true, wordMap[word]['groupeElementJSON'], wordVariableMap[word.toLowerCase()]);
        } else {
          createOverlappingElements(scene360, projectF, {
            translate: {
              xCoord: (idx > 0 ? (xCoord += horizontalSpacing + width) : xCoord),
              yCoord,
              zCoord
            },
            dimensions: {
              width, height
            },
            colors: params.colors,
            font: params.font
          }, letter, word);
        }
      })
      yCoord -= (verticalSpacing + height);
    });

    addVarRules(scene360, words);

    // printing what json looks like
    console.log(json);

    // sending it to my sample project
    updateProject(json, params.project.uuid);
    const output = projectF.copyToClipboardObject([scene360.id]);
    navigator.clipboard.writeText(JSON.stringify(output));
    console.log('output: ', output);
  }
}