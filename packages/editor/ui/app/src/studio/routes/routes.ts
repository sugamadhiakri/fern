import { ROOT_PATH } from "@fern-api/routing-utils";

export const STUDIO = ROOT_PATH.addPath("studio");
export const API_CONFIGURATION = STUDIO.addPath("api-configuration");
export const SDK_CONFIGURATION = STUDIO.addPath("sdks");
export const API_EDITOR_ITEM = STUDIO.addParameter("EDITOR_ITEM_ID");
export const TYPES_GROUP = API_EDITOR_ITEM.addPath("types");
export const ERRORS_GROUP = API_EDITOR_ITEM.addPath("errors");
