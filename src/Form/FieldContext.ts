import React from "react"
import { FormInstance } from "./typings"


export type FieldContextValueType = { formStore: FormInstance }
const FieldContext = React.createContext<FieldContextValueType>(undefined as any)
export default FieldContext


