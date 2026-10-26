# SchGen Lab · 静态成果展示

SchGen 方法的小规模复现实验展示。页面展示 MiniCPM5-2B 第三轮 LoRA 模型已保存的电路案例，包括原始需求、KiCad 原理图、PCB 预览与对应检查结果。

本仓库提供纯静态 HTML、CSS、JavaScript 和 SVG 文件。选择案例只切换预先保存的内容，不进行模型推理、代码执行或 PCB 布线，不连接 Colab 或本机后台。

界面复用本机工作台的页面结构、样式和五个示例，保留双栏布局、需求预览与编辑、生成流程、原理图和 PCB 预览。运行、导入与下载按钮在展示版中禁用；三个示例附有已保存结果，另两个示例仅展示原题需求。

## 案例与检查范围

- 使用 SchGen 官方数据集中的原始用户需求，保留其元件与连接描述；每个案例标明数据集行号。
- 预览来自既有执行产物，不是示意图或新生成的答案。
- ERC、DRC 数量和未启用规则按对应保存报告展示；DRC 零错误不代表已验证电路功能或具备直接生产条件。
- 本项目为独立的小规模复现展示，不是 SchGen 官方演示。

方法及原始数据来源：[Microsoft SchGen](https://github.com/microsoft/SchGen)。基座模型：[OpenBMB MiniCPM5-2B](https://huggingface.co/openbmb/MiniCPM5-2B)。

## 本地预览

在仓库目录执行 `python -m http.server 8780 --bind 127.0.0.1`，然后打开 `http://127.0.0.1:8780/`。

## GitHub Pages

在仓库 Settings → Pages 选择 **Deploy from a branch**，分支为 `main`、目录为 `/ (root)`。仓库中的 `.nojekyll` 用于直接发布静态文件，无需安装构建依赖。

网页资源使用相对路径，可以部署在 GitHub Pages 的仓库子路径。更新展示数据只需修改静态文件并推送；不要加入本机运行记录、访问凭据、模型权重或后台程序。

第三方 Markdown 渲染依赖为 marked 和 DOMPurify，其许可证保留在 `vendor/` 目录。
