FROM governify/base-assets-manager:stable
USER root

#Add assets manager dependencies (in another folder to avoid overwriting package.json)
WORKDIR /home
COPY package.json package.json
RUN npm install
WORKDIR /home/theia

#Add assets manager files
COPY assets-manager.js /home/theia/src-gen/backend/assets-manager.js
COPY server.js /home/theia/src-gen/backend/server.js
COPY configurations /home/theia/src-gen/backend/configurations
COPY git-downloader.js /home/theia/src-gen/backend/git-downloader.js

# COPY files* /home/project
COPY extensions* /home/theia/.theia/extensions

#Override for incrementing body size limit on requests (Done in base image)
# COPY fileOverrides/file-download-endpoint.ts /home/theia/node_modules/@theia/filesystem/lib/node/download/file-download-endpoint.js

# DB Backups volume permissions
RUN mkdir -p /home/project/public/database/backups;

# Permissions
RUN chown -R theia:theia /home/project

USER theia
EXPOSE 80

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ENTRYPOINT [ "node", "/home/theia/src-gen/backend/main.js", "/home/project", "--hostname=0.0.0.0" ]


