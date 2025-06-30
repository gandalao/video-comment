import service from "../utils/axios";

export function getVideoList(data: any) {
  return service({
    url: "/video/list",
    method: "post",
    data,
  });
}

export function addVideo(data: any) {
  return service({
    url: "/video/add",
    method: "post",
    data,
  });
}
export function editVideo(data: any) {
  return service({
    url: "/video/edit",
    method: "post",
    data,
  });
}
export function removeVideo(id: string) {
  return service.delete("/video/delete/" + id);
}

export function removeVideos(data: any) {
  return service({
    url: "/video/batchDelete",
    method: "post",
    data,
  });
}

export function upload(data: any) {
  return service({
    url: "/video/upload",
    method: "post",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
