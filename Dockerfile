FROM theiaide/theia:1.10.0
USER root

#Fix for deploy on port 80
RUN apk add libcap
RUN setcap 'cap_net_bind_service=+ep' /usr/local/bin/node

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
COPY files* /home/project
RUN mkdir /home/theia/.theia
COPY extensions* /home/theia/.theia/extensions

#Override for incrementing body size limit on requests
COPY fileOverrides/file-download-endpoint.ts /home/theia/node_modules/@theia/filesystem/lib/node/download/file-download-endpoint.js
RUN chown -R theia:theia /home/project;
RUN chown -R theia:theia /home/theia/.theia
RUN chown -R theia:theia /home/theia/.config
USER theia
EXPOSE 80
ENTRYPOINT [ "node", "/home/theia/src-gen/backend/main.js", "/home/project", "--hostname=0.0.0.0" ]


