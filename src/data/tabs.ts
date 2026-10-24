import type { IconName } from "../components/icons";
import type { TabId } from "../types";

export interface TabDef {
  id: TabId;
  icon: IconName;
  label: string;
}

export const TABS: TabDef[]=[{id:"home",icon:"home",label:"Home"},{id:"nutrition",icon:"nutrition",label:"Nutrition"},{id:"body",icon:"body",label:"Body"},{id:"workouts",icon:"workouts",label:"Workouts"},{id:"settings",icon:"profile",label:"Profile"}];
