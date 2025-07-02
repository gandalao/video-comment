import service from "../utils/axios";

export function getVideoData(data: any) {
  return service({
    url: "/video/list",
    method: "post",
    data,
  });
}

export function addVideoData(data: any) {
  return service({
    url: "/video/add",
    method: "post",
    data,
  });
}
export function editVideoData(data: any) {
  return service({
    url: "/video/edit",
    method: "post",
    data,
  });
}
export function removeVideoData(id: string) {
  return service.delete("/video/delete/" + id);
}

export function batchRemoveVideoData(data: any) {
  return service({
    url: "/video/batchDelete",
    method: "post",
    data,
  });
}

export function upload(data: any) {
  let headers = {};
  if (!data?.imageUrl) {
    headers = {
      "Content-Type": "multipart/form-data",
    };
  }

  return service({
    url: "/video/upload",
    method: "post",
    data,
    headers,
  });
}

export function exportVideoInfo() {
  return service.get("/video/download");
}
