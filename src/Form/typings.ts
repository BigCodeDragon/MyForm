import { FieldContextValueType } from "./FieldContext"

export type Store = {
  setInitialValues?: (initialValues: Store | undefined, init: boolean) => void;
  getFieldValue?: (name: string) => any;
  getFieldsValue?: () => Store;
  updateValue?: (name: string | undefined, value: any) => void;
  getFieldEntities?: () => FieldEntity[]
  notifyObservers?: (prevStore: Store,
    namePathList: string[] | undefined,
    info: NotifyInfo) => void;
  initEntityValue?: (entity: FieldEntity) => void;
  registerField?: (entity: FieldEntity) => void;
  [props: string]: any;
}
export interface Callbacks<Values = any> {
  onValueChange?: (
    changeValue: Record<string, any>,
    values: Record<string, any>
  ) => void;
  onFinish?: (values: Values) => void;
}


export type FieldProps = {
  name?: string;
  label?: string;
  initialValue?: any;
  children?: React.ReactElement;
  /** 受控组件的值的属性名，一般是value */
  valuePropName?: string;
  /** 触发组件组件值改变的事件，一般是onChange */
  trigger?: string;
  /** 从元素事件里获取value的方法，一般是event.target.value */
  getValueFromEvent?: (...args: any[]) => any;
  fieldContext: FieldContextValueType;
}
export type FieldEntity = {
  props: FieldProps;
  onStoreChange: (store: Store, namePathList: string[] | undefined, mergedInfo: ValuedNotifyInfo) => void;
}

export type NotifyInfo = { type: 'reset' | 'valueUpdate'; sourece?: string; }

export type ValuedNotifyInfo = NotifyInfo & {
  store: Store;
};

