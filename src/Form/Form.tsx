import { useMemo, useRef } from "react";
import WrapperField from "./Field";
import FieldContext, { FieldContextValueType } from "./FieldContext";
import { FormStore } from "./FormStore";
import type { Store } from "./typings";

type BaseFormProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  "onSubmit"
>;
// 第一阶段的props需要实现的参数只有initialValues、children
export type FormProps = BaseFormProps & {
  initialValues?: Store;
  children?: React.ReactNode;
};

const Form = (props: FormProps) => {
  const { initialValues, children } = props;
  // formStore的实例就是表单的数据状态和fieldEntities的对象
  const formStore = useRef<FormStore>(new FormStore());
  const mountRef = useRef(false);

  // 如果有initialValues就初始化表单的数据状态
  if (initialValues) {
    formStore.current.setInitialValues(initialValues, mountRef.current);
  }
  if (!mountRef.current) {
    mountRef.current = true;
  }

  // 创建fieldContextValue用于注入到下面的FieldContext
  // 注入后子组件都能访问fieldContextValue
  const fieldContextValue = useMemo<FieldContextValueType>(
    () => ({
      formStore: formStore.current,
    }),
    []
  );

  return (
    <form>
      <FieldContext.Provider value={fieldContextValue}>
        {children}
      </FieldContext.Provider>
    </form>
  );
};
Form.Item = WrapperField;
export default Form;
