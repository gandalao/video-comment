import service from "../utils/axios";

export function login(data: any) {
  return service({
    url: "/user/login",
    method: "post",
    data,
  });
}
