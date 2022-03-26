import React from "react";
import { useMemo, useRef } from "react";
import Field from "./Field";
import FieldContext, { FieldContextValueType } from "./FieldContext";
import { useForm } from "./FormStore";
import { FormInstance } from "./typings";

type BaseFormProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  "onSubmit"
>;
// 第一阶段的props需要实现的参数只有initialValues、children
export type FormProps = BaseFormProps & {
  initialValues?: Record<string, any>;
  onFinish?: (values: any) => void;
  onValueChange?: (
    changeValue: Record<string, any>,
    values: Record<string, any>
  ) => void;
  children?: React.ReactNode;
  form: FormInstance;
};

const Form: React.ForwardRefRenderFunction<FormInstance, FormProps> = (
  { initialValues, children, onFinish, onValueChange, form },
  ref
) => {
  // const { initialValues, children, onFinish, onValueChange } = props;
  // formStore的实例就是表单的数据状态和fieldEntities的对象
  // const formStore = useRef<FormStore>(new FormStore());
  const [formStore] = useForm(form);
  const mountRef = useRef(false);
  if (!mountRef.current) {
    // 设置全局的初始化值

    formStore.getInternalHooks().setInitialValues(initialValues);
    // 初始化回调函数
    formStore.getInternalHooks().setCallbacks({ onFinish, onValueChange });
  }
  if (!mountRef.current) {
    mountRef.current = true;
  }
  // 如果用户是通过ref获取表单实例，则通过useImperativeHandle把formInstance返回出去
  React.useImperativeHandle(ref, () => formStore);
  // 创建fieldContextValue用于注入到下面的FieldContext
  // 注入后子组件都能访问fieldContextValue
  const fieldContextValue = useMemo<FieldContextValueType>(
    () => ({
      formStore: formStore,
    }),
    [formStore]
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        formStore.submit();
      }}
      onReset={(e) => {
        e.preventDefault();
        e.stopPropagation();
        formStore.resetFields();
      }}
    >
      <FieldContext.Provider value={fieldContextValue}>
        {children}
      </FieldContext.Provider>
    </form>
  );
};
const InternalForm = React.forwardRef<FormInstance, FormProps>(Form);
type InternalFormType = typeof InternalForm;

interface RefFormType extends InternalFormType {
  Item: typeof Field;
  useForm: typeof useForm;
}

const RefForm: RefFormType = InternalForm as RefFormType;

RefForm.Item = Field;
RefForm.useForm = useForm;

export { Field as Item };

export default RefForm;
