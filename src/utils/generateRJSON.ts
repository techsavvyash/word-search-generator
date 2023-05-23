import { r, rtp, RT, migrations, en, createRecord, rn } from '@gmetrixr/rjson'
import axios from 'axios';

import { createWordSearch } from './wordSearch';


export type JSONParams = {
  translate?: {
    xCoord?: number,
    yCoord?: number,
    zCoord?: number
    horizontalSpacing?: number,
    verticalSpacing?: number,
  };
  dimensions?: {
    width?: number,
    height?: number,
  }
}
const defaultParams: JSONParams = {
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

export const gen = (words: string[], gridSize: number, params: JSONParams = defaultParams) => {
  const { grid, wordMap } = createWordSearch(words.map((word: string) => word.toUpperCase()), gridSize);
  console.log('wordMap: ', wordMap);
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

  // json for the scene
  // const scene = projectF.getRecord(RT.scene, initialSceneId);

  if (scene360) {
    const { translate, dimensions } = params;
    let { xCoord, yCoord } = translate;
    const { zCoord, horizontalSpacing, verticalSpacing } = translate
    const { width, height } = dimensions; //.width, height = dimensions.height;
    const initialXCoord = xCoord ?? (-1) * (gridSize * width + (gridSize - 1) * horizontalSpacing) / 2;


    projectF.addElementOfTypeToScene({ sceneId: scene360.id, elementType: en.ElementType.pano_image });
    grid.reverse().forEach((row: string[]): void => {
      xCoord = initialXCoord;
      row.forEach((letter: string, idx: number): void => {
        // const sceneF = r.scene(scene);
        const groupElement = projectF.addElementOfTypeToScene({
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

          // const elementJSON = sceneF. (RT.element);

          if (elementJSON && yellowElementJSON) {
            // element factory
            const xPosn = (idx > 0 ? (xCoord += horizontalSpacing + width) : xCoord);
            const yellowF = r.element(yellowElementJSON);
            yellowF.set(rtp.element.text, letter);
            yellowF.set(rtp.element.wh, [width, height]);
            yellowF.set(rtp.element.placer_3d, [
              xPosn,
              yCoord,
              zCoord,
              0, 0, 0, 1, 1, 1]);
            yellowF.set(rtp.element.font_size, 1.0);
            // yellowF.set(rtp.element.radius, 0.7);
            yellowF.set(rtp.element.background_color, '#F8E71C');
            // yellowF.set(rtp.element.font_weight, 'bold');
            yellowF.set(rtp.element.border_color, '#000000');
            yellowF.set(rtp.element.border_radius, 0.7);
            yellowF.set(rtp.element.border_width, 0.1);
            yellowF.set(rtp.element.hidden, true);
            const elementF = r.element(elementJSON);

            elementF.set(rtp.element.text, letter);
            elementF.set(rtp.element.wh, [width, height]);
            elementF.set(rtp.element.placer_3d, [
              xPosn,
              yCoord,
              zCoord,
              0, 0, 0, 1, 1, 1]);
            elementF.set(rtp.element.font_size, 1.0);
            // elementF.set(rtp.element.radius, 0.7);
            elementF.set(rtp.element.background_color, '#0C4494');
            // elementF.set(rtp.element.font_weight, 'bold');
            elementF.set(rtp.element.border_color, '#000000');
            elementF.set(rtp.element.border_radius, 0.7);
            elementF.set(rtp.element.border_width, 0.1);



            const rule = createRecord(RT.rule);
            const ruleF = r.record(rule);

            // when
            const whenEvent = createRecord(RT.when_event);
            const whenEventF = r.record(whenEvent);
            whenEventF.set(rtp.when_event.event, rn.RuleEvent.on_click);
            whenEventF.set(rtp.when_event.co_id, elementJSON?.id);
            whenEventF.set(rtp.when_event.co_type, elementJSON?.props.element_type);

            // then blue should hide at 0 sec
            const thenAction1 = createRecord(RT.then_action);
            const thenAction1F = r.record(thenAction1);
            thenAction1F.set(rtp.then_action.action, rn.RuleAction.hide);
            thenAction1F.set(rtp.then_action.co_id, elementJSON?.id);
            thenAction1F.set(rtp.then_action.co_type, elementJSON?.props.element_type);

            // then yellow should appear at 0 sec
            const thenAction2 = createRecord(RT.then_action);
            const thenAction2F = r.record(thenAction2);
            thenAction2F.set(rtp.then_action.action, rn.RuleAction.show);
            thenAction2F.set(rtp.then_action.co_id, yellowElementJSON?.id);
            thenAction2F.set(rtp.then_action.co_type, yellowElementJSON?.props.element_type);

            // then yellow should hide at 1 sec
            const thenAction3 = createRecord(RT.then_action);
            const thenAction3F = r.record(thenAction3);
            thenAction3F.set(rtp.then_action.action, rn.RuleAction.hide);
            thenAction3F.set(rtp.then_action.co_id, yellowElementJSON?.id);
            thenAction3F.set(rtp.then_action.co_type, yellowElementJSON?.props.element_type);
            thenAction3F.set(rtp.then_action.delay, 1.0);


            // then blue should appear at 1 sec
            const thenAction4 = createRecord(RT.then_action);
            const thenAction4F = r.record(thenAction4);
            thenAction4F.set(rtp.then_action.action, rn.RuleAction.show);
            thenAction4F.set(rtp.then_action.co_id, elementJSON?.id);
            thenAction4F.set(rtp.then_action.co_type, elementJSON?.props.element_type);
            thenAction4F.set(rtp.then_action.delay, 1.0);

            ruleF.addRecord(whenEvent);
            ruleF.addRecord(thenAction1);
            ruleF.addRecord(thenAction2);
            ruleF.addRecord(thenAction3);
            ruleF.addRecord(thenAction4);

            // projectF.addRecord(rule);
            const sceneF = r.scene(scene360);
            sceneF.addRecord(rule);
          }
        }
      })
      yCoord += (verticalSpacing + height);
    });

    // printing what json looks like
    console.log(json);

    // sending it to my sample project
    axios.post('https://api.gmetri.com/sdk/project/updateJSON', {
      projUuid: 'e8ffb6c8-2b10-4041-b270-37258cf3ed48',
      json
    }, {
      headers: {
        Authorization: import.meta.env.VITE_AUTH_HEADER
      }
    }).then(res => {
      console.log(res.data);
      console.log('updated json');
    })
  }
}

