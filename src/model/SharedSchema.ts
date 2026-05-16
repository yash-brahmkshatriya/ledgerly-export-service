import { components } from "../../types";
export type StructuredExpense = components["schemas"]["StructuredExpense"];
export type Split = StructuredExpense["split"];
export type Status = StructuredExpense["status"];
export type TrainingStatus = StructuredExpense["trainingStatus"];
