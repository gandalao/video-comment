import service from "../utils/axios";

export function getActorData(data: any) {
  return service({
    url: "/actor/list",
    method: "post",
    data,
  });
}

export function addActorData(data: any) {
  return service({
    url: "/actor/add",
    method: "post",
    data,
  });
}
export function editActorData(data: any) {
  return service({
    url: "/actor/edit",
    method: "post",
    data,
  });
}
export function removeActorData(id: string) {
  return service.delete("/actor/delete/" + id);
}

export function batchRemoveVideoDataActorData(data: any) {
  return service({
    url: "/actor/batchDelete",
    method: "post",
    data,
  });
}

