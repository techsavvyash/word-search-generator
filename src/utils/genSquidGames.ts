import { r, rtp, RT, migrations, en, createRecord, rn, RecordNode, vn } from '@gmetrixr/rjson'
import axios from 'axios';
import { ElementType } from '@gmetrixr/rjson/lib/cjs/r/definitions/elements';
import { QuestionProps } from '../types';
import { updateProject } from './utils';

export const genSquidGames = async (questins: QuestionProps[], uuid: string) => {
  // initialise scene
  const json = migrations.createNewProject();
  const projectF = r.project(json);
  const initialSceneId = projectF.getInitialSceneId();
  const scene = projectF.getRecord(RT.scene, initialSceneId); // getScene(initialSceneId);
  const sceneF = r.scene(scene);

  // data 
  const correctAnswerZones = [];
  const questionTextElements = [];
  const questionFlagVariables = [];

  let xCoord = -1;
  const yCoord = 0, zCoord = 2;

  // generate text elements
  questins.forEach((ques: QuestionProps, idx: number) => {
    const textElement = projectF.addElementOfTypeToScene({
      sceneId: initialSceneId,
      elementType: ElementType.text
    });

    textElement.name = `question_${idx + 1}`

    const textElementF = r.element(textElement);
    textElementF.set(rtp.element.placer_3d, [
      xCoord + 1,
      yCoord + 2,
      ((zCoord + ((questins.length + 1) * 2))),
      0,
      180,
      0
    ]);
    textElementF.set(rtp.element.text, ques.question);

    // genearting flag variables for each ques
    const variable = createRecord(RT.variable);
    const variableF = r.record(variable);
    variable.name = `question_${idx + 1}_flag`
    variableF.set(rtp.variable.var_type, vn.VariableType.number);
    variableF.set(rtp.variable.var_category, vn.VarCategory.user_defined);
    variableF.set(rtp.variable.var_track, true);
    variableF.set(rtp.variable.var_default, 0);
    if (idx > 0) {
      textElementF.set(rtp.element.hidden, true);
    }
    questionTextElements.push(textElement);
    questionFlagVariables.push(variable);
    projectF.addRecord(variable);
  });

  //create a game ended text element
  const gameEndedTextElement = projectF.addElementOfTypeToScene({
    sceneId: initialSceneId,
    elementType: ElementType.text
  });

  gameEndedTextElement.name = `game_ended_text`
  const gameEndedTextElementF = r.element(gameEndedTextElement);
  gameEndedTextElementF.set(rtp.element.placer_3d, [
    xCoord + 1,
    yCoord + 2,
    ((zCoord + (4 * 2))),
    0,
    180,
    0
  ]);
  gameEndedTextElementF.set(rtp.element.text, "Game Over");
  gameEndedTextElementF.set(rtp.element.hidden, true);
  questionTextElements.push(gameEndedTextElement);

  const firstZone = projectF.addElementOfTypeToScene({
    sceneId: initialSceneId,
    elementType: ElementType.zone
  });

  for (let row = 0; row < questins.length; row++) {
    xCoord = -1;
    // code to randomly select 0 or 1
    const random = Math.floor(Math.random() * 2);
    for (let col = 0; col < 2; col++) {
      const zoneElement = projectF.addElementOfTypeToScene({
        sceneId: initialSceneId,
        elementType: ElementType.zone
      });

      const zoneElementF = r.element(zoneElement);
      zoneElementF.set(rtp.element.placer_3d, [
        xCoord + col * (0.5 + 2),
        yCoord,
        zCoord + (row * 2)
      ]);

      // generating zone text element
      const zoneTextElement = projectF.addElementOfTypeToScene({
        sceneId: initialSceneId,
        elementType: ElementType.text
      });
      zoneElement.name = `question_${row + 1}_zone_text`
      const zoneTextElementF = r.element(zoneTextElement);
      zoneTextElementF.set(rtp.element.placer_3d, [
        xCoord + col * (0.5 + 2),
        yCoord,
        zCoord + (row * 2),
        -90,
        180,
        0
      ]);
      zoneTextElementF.set(rtp.element.wh, [2, 2]);
      zoneTextElementF.set(rtp.element.font_size, 0.2);
      zoneTextElementF.set(rtp.element.background_color, '#7ED321');

      if (col == random) {
        zoneElementF.set(rtp.element.text, questins[row].options.correct)
        zoneElement.name = `question_${row + 1}_correct_ans`
        zoneTextElementF.set(rtp.element.text, questins[row].options.correct);
        correctAnswerZones.push(zoneElement);

        const rule = createRecord(RT.rule);
        const ruleF = r.record(rule);
        // add a enter event on this zone
        const whenEvent = createRecord(RT.when_event);
        const whenEventF = r.record(whenEvent);
        whenEventF.set(rtp.when_event.event, rn.RuleEvent.on_enter);
        whenEventF.set(rtp.when_event.co_id, -102);
        whenEventF.set(rtp.when_event.co_type, "viewer");
        whenEventF.set(rtp.when_event.properties, [zoneElement?.id]);
        // check for flag var to be false
        const flagVar = questionFlagVariables[row];
        const whenEvent2 = createRecord(RT.when_event);
        const whenEvent2F = r.record(whenEvent2);
        whenEvent2F.set(rtp.when_event.event, rn.RuleEvent.on_set_eq);
        whenEvent2F.set(rtp.when_event.co_id, flagVar?.id);
        whenEvent2F.set(rtp.when_event.co_type, flagVar?.props.var_type);
        whenEvent2F.set(rtp.when_event.properties, [0]);

        // toggle the question hide
        console.log(questionTextElements[row]);
        const currentQuestion = questionTextElements[row];
        const thenAction = createRecord(RT.then_action);
        const thenActionF = r.record(thenAction);
        thenActionF.set(rtp.then_action.action, rn.RuleAction.hide);
        thenActionF.set(rtp.then_action.co_id, currentQuestion.id);
        thenActionF.set(rtp.then_action.co_type, currentQuestion.props.element_type);

        // const nextQuesIdx = (((row + 1) > 2) ? 0 : (row + 1));
        const nextQuesIdx = row + 1;
        const thenAction2 = createRecord(RT.then_action);
        const thenAction2F = r.record(thenAction2);
        thenAction2F.set(rtp.then_action.action, rn.RuleAction.show);
        thenAction2F.set(rtp.then_action.co_id, questionTextElements[nextQuesIdx]?.id);
        thenAction2F.set(rtp.then_action.co_type, questionTextElements[nextQuesIdx]?.props.element_type);

        // set the flag to true
        const thenAction3 = createRecord(RT.then_action);
        const thenAction3F = r.record(thenAction3);
        thenAction3F.set(rtp.then_action.action, rn.RuleAction.add_number);
        thenAction3F.set(rtp.then_action.properties, [1]);
        thenAction3F.set(rtp.then_action.co_id, questionFlagVariables[row]?.id);
        thenAction3F.set(rtp.then_action.co_type, questionFlagVariables[row]?.props.var_type);


        ruleF.addRecord(whenEvent);
        ruleF.addRecord(whenEvent2);
        ruleF.addRecord(thenAction);
        ruleF.addRecord(thenAction2);
        ruleF.addRecord(thenAction3);
        sceneF.addRecord(rule);
      } else {
        zoneElementF.set(rtp.element.text, questins[row].options.incorrect)
        zoneElement.name = `question_${row + 1}_incorrect_ans`
        zoneTextElementF.set(rtp.element.text, questins[row].options.incorrect);
        const belowGroundZones = [zoneElement];
        // create more down the ground level elements
        for (let i = 1; i < 4; i++) {
          const newZone = projectF.addElementOfTypeToScene({
            sceneId: initialSceneId,
            elementType: ElementType.zone
          });
          const newZoneF = r.element(newZone);
          newZoneF.set(rtp.element.placer_3d, [
            xCoord + col * (0.5 + 2),
            yCoord - i * 10,
            zCoord + (row * 2)
          ]);
          belowGroundZones.push(newZone);
          const newRule = createRecord(RT.rule);
          const newRuleF = r.record(newRule);
          // add when event
          const enteredZone = belowGroundZones[i - 1];
          const newWhenEvent = createRecord(RT.when_event);
          const newWhenEventF = r.record(newWhenEvent);
          newWhenEventF.set(rtp.when_event.event, rn.RuleEvent.on_enter);
          newWhenEventF.set(rtp.when_event.co_id, -102);
          newWhenEventF.set(rtp.when_event.co_type, "viewer");
          newWhenEventF.set(rtp.when_event.properties, [enteredZone?.id]);
          const flagVar = questionFlagVariables[row];
          const whenEvent2 = createRecord(RT.when_event);
          const whenEvent2F = r.record(whenEvent2);
          whenEvent2F.set(rtp.when_event.event, rn.RuleEvent.on_set_eq);
          whenEvent2F.set(rtp.when_event.co_id, flagVar?.id);
          whenEvent2F.set(rtp.when_event.co_type, flagVar?.props.var_type);
          whenEvent2F.set(rtp.when_event.properties, [0]);

          // then action
          const zoneToTeleportTo = belowGroundZones[i];
          const newThenAction = createRecord(RT.then_action);
          const newThenActionF = r.record(newThenAction);
          newThenActionF.set(rtp.then_action.action, rn.RuleAction.teleport);
          newThenActionF.set(rtp.then_action.co_id, -102);
          newThenActionF.set(rtp.then_action.co_type, "viewer");
          newThenActionF.set(rtp.then_action.properties, [zoneToTeleportTo?.id]);

          newRuleF.addRecord(newWhenEvent);
          newRuleF.addRecord(whenEvent2);
          newRuleF.addRecord(newThenAction);
          sceneF.addRecord(newRule);
        }

        // add rule to teleport user to the last right answer
        const newRule = createRecord(RT.rule);
        const newRuleF = r.record(newRule);
        // add when event
        const newWhenEvent = createRecord(RT.when_event);
        const newWhenEventF = r.record(newWhenEvent);
        newWhenEventF.set(rtp.when_event.event, rn.RuleEvent.on_enter);
        newWhenEventF.set(rtp.when_event.co_id, -102);
        newWhenEventF.set(rtp.when_event.co_type, "viewer");
        newWhenEventF.set(rtp.when_event.properties, [belowGroundZones[belowGroundZones.length - 1]?.id]);
        // then action
        // const zoneToTeleportTo = correctAnswerZones[row];
        const newThenAction = createRecord(RT.then_action);
        const newThenActionF = r.record(newThenAction);
        newThenActionF.set(rtp.then_action.action, rn.RuleAction.teleport);
        newThenActionF.set(rtp.then_action.co_id, -102);
        newThenActionF.set(rtp.then_action.co_type, "viewer");
        newThenActionF.set(rtp.then_action.properties, [firstZone?.id]);

        newRuleF.addRecord(newWhenEvent);
        newRuleF.addRecord(newThenAction);
        sceneF.addRecord(newRule);
      }
    }
  }

  updateProject(json, uuid);
}



