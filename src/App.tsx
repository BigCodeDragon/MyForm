import React from "react";
import Form from "./Form/Form";

function App() {
  const [form] = Form.useForm();
  const onFinish = (values: any) => {
    console.log(values);
  };
  const onValueChange = (value1: any, value2: any) => {
    console.log(value1, value2);
  };
  return (
    <Form
      form={form}
      initialValues={{ username: "黄康锐", gender: "man" }}
      onFinish={onFinish}
      onValueChange={onValueChange}
    >
      <Form.Item name="username" label="姓名">
        <input type="text" />
      </Form.Item>
      <Form.Item label="性别" name="gender">
        <select>
          <option value="man">男</option>
          <option value="women">女</option>
        </select>
      </Form.Item>
      <button type="submit">表单提交</button>
      <button type="reset">表单重置</button>
      <button type="button" onClick={form.submit}>
        实例提交
      </button>
      <button type="button" onClick={() => form.resetFields()}>
        实例重置
      </button>
    </Form>
  );
}

export default App;
