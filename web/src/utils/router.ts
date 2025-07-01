import { merge } from "lodash";

// 是否外链
export const isExternal = (path: string): boolean =>
  /^(https?:|mailto:|tel:)/.test(path);
export const formatRoutes = (routes, parentPath = "/", parentPaths = []) => {
  const items = [];
  let jsonItems = {};

  routes.forEach((item) => {
    // 设置路径
    let path = item.path || "";
    if (!isExternal(item.path)) {
      path = item.path.startsWith("/")
        ? item.path
        : `${parentPath.endsWith("/") ? parentPath : `${parentPath}/`}${
            item.path
          }`;
    }
    item.path = path;

    // 设置 meta
    const meta = item.meta || {};
    // 设置 meta.parentPath
    const pPaths =
      meta.parentPath && meta.parentPath.length > 0
        ? meta.parentPath
        : parentPaths;
    meta.parentPath = pPaths;
    item.meta = meta;

    // children赋值
    let pkChildren;
    if (item.children) {
      const cRoutes = formatRoutes(item.children, path, [...pPaths, path]);
      item.children = cRoutes.router;
      pkChildren = cRoutes.pathKeyRouter;
    }

    // 最终 item 赋值
    items.push(item);
    jsonItems[path] = item;
    if (pkChildren) {
      jsonItems = merge(jsonItems, pkChildren);
    }
  });

  return {
    router: items,
    pathKeyRouter: jsonItems,
  };
};
