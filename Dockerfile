# • Docker运行步骤

#   - 在项目根目录执行 docker build -t tail-app:latest .，Docker 会用 Node 阶段 
#     构建产物，再打包进 Nginx 镜像；若在 Apple Silicon 但目标是 x86_64，可附加 
#     --platform linux/amd64。
#   - 构建完成后运行 docker run --rm -p 5173:80 tail-app:latest（或改成你想曝光 
#     的端口），浏览器访问 http://localhost:5173 验证页面。
#   - 首次构建最好准备 .dockerignore（排除 node_modules/、dist/ 等），可显著降低
#     镜像体积与缓存失效频率。
#   - 如果需要向前端注入环境变量，继续沿用 Vite 规则，在构建前写入 VITE_ 前缀   
#     的 .env；镜像是纯静态站点，运行期无法再修改这些变量。
#   - 想要热更新开发体验，可单独写一个基于 node:22-alpine 的 Dockerfile 或      
#     compose 服务，映射代码目录并运行 pnpm dev。


# Stage 1: build stage
FROM node:22-alpine as build-stage
# make the 'app' folder the current working directory
WORKDIR /app
# config node options
ENV NODE_OPTIONS=--max_old_space_size=8192
# config pnpm, install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN npm install pnpm@9.x -g && \
    pnpm install --frozen-lockfile
# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . ./
# build the project
RUN pnpm build
RUN echo "build successful  🎉 🎉 🎉"


# Stage 2: production stage
FROM nginx:latest as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
RUN echo "deploy to nginx successful  🎉 🎉 🎉"

