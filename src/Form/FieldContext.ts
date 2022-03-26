import React from "react"
import { Store } from "./typings"


export type FieldContextValueType = { formStore: Store }
const FieldContext = React.createContext<FieldContextValueType>(undefined as any)
export default FieldContext


