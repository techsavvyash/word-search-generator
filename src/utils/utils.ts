import axios from "axios";

export const updateProject = (json: any, uuid: string) => {
  const projUuid = uuid && uuid.trim() !== '' ? uuid : '90e705aa-a201-42b0-ac1a-43268a86e187';
  axios.post('https://api.gmetri.com/sdk/project/updateJSON', {
    projUuid,
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