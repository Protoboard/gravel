/* jshint node:true */
module.exports = function (grunt) {
  "use strict";

  const modules = [
    "gravel-model",
    "gravel-routing"
  ];

  grunt.initConfig({
    clean: modules.reduce((config, module) => {
      config[`${module}-package-lock`] = [`modules/${module}/package-lock.json`];
      config[`${module}-dist`] = [`modules/${module}/dist`];
      config[`${module}-node_modules`] = [`modules/${module}/node_modules`];
      return config;
    }, {
      "node_modules": ["node_modules"],
      "package-lock": ["package-lock.json"]
    }),

    watch: modules.reduce((config, module) => {
      config[module] = {
        files: [`modules/${module}/src/**/*.ts`],
        tasks: [`build-quick-${module}`]
      };
      return config;
    }, {}),

    tslint: modules.reduce((config, module) => {
      config[module] = {
        options: {
          configuration: "tslint.json"
        },
        files: {
          src: [`modules/${module}/src/**/*.ts`]
        }
      };
      return config;
    }, {}),

    exec: modules.reduce((config, module) => {
      config[`ts-${module}`] = {
        cwd: `modules/${module}`,
        cmd: "npx --no-install tsc"
      };
      config[`jasmine-${module}`] = {
        cwd: `modules/${module}`,
        cmd: "npx jasmine dist/**/*.spec.js"
      };

      const pkg = grunt.file.readJSON(`modules/${module}/package.json`);
      const deps = Object.keys(pkg.dependencies || {})
      .filter((name) => /^@protoboard.*$/.test(name));
      config[`link-${module}-deps`] = {
        cwd: `modules/${module}`,
        cmd: deps
        .map((dep) => `npm ln ${dep}`)
        .join(" && ") || "echo noop"
      };
      config[`link-${module}-self`] = {
        cwd: `modules/${module}`,
        cmd: "npm ln",
        exitCode: [0, 1]
      };
      config[`unlink-${module}`] = {
        cwd: `modules/${module}`,
        cmd: "npm unlink"
      };

      return config;
    }, {}),

    notify: modules.reduce((config, module) => {
      config[`build-${module}`] = {
        options: {
          message: `Module "${module}" built.`
        }
      };
      config[`test-${module}`] = {
        options: {
          message: `Tests for "${module}" passed.`
        }
      };
      return config;
    }, {
      build: {
        options: {
          message: "All modules built."
        }
      }
    })
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-tslint");
  grunt.loadNpmTasks("grunt-exec");
  grunt.loadNpmTasks("grunt-notify");

  modules.forEach((module) => {
    grunt.registerTask(`test-${module}`, [
      `tslint:${module}`,
      `exec:jasmine-${module}`
    ]);
    grunt.registerTask(`build-quick-${module}`, [
      `clean:${module}-dist`,
      `exec:ts-${module}`, `notify:build-${module}`
    ]);
    grunt.registerTask(`build-${module}`, [
      `clean:${module}-dist`,
      `tslint:${module}`, `exec:ts-${module}`,
      `test-${module}`, `notify:build-${module}`
    ]);
  });
  grunt.registerTask("clean-dist", modules
  .map((module) => `clean:${module}-dist`));
  grunt.registerTask("clean-package-lock", modules
  .map((module) => `clean:${module}-package-lock`)
  .concat("clean:package-lock"));
  grunt.registerTask("clean-node_modules", modules
  .reduce((tasks, module) => {
    tasks.push(`clean:${module}-node_modules`);
    tasks.push(`exec:unlink-${module}`);
    return tasks;
  }, ["clean:node_modules"]));
  grunt.registerTask("ts", modules
  .map((module) => `exec:ts-${module}`));
  grunt.registerTask("test", modules
  .map((module) => `test-${module}`));
  grunt.registerTask("build-quick", ["clean-dist", "ts", "notify:build"]);
  grunt.registerTask("build", [
    "clean-dist", "tslint", "ts", "test", "notify:build"]);
  grunt.registerTask("postinstall", modules
  .reduce((tasks, module) => {
    tasks.push(`exec:link-${module}-deps`, `exec:link-${module}-self`);
    return tasks;
  }, []));
  grunt.registerTask("default", ["build-quick", "watch"]);
};