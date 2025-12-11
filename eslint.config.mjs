/* eslint import/no-unresolved: "off" */

import { defineConfig } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import _import from "eslint-plugin-import";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import stylistic from "@stylistic/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default defineConfig([
	{
		extends: fixupConfigRules(
			compat.extends("eslint:recommended", "plugin:import/errors", "prettier"),
		),
		plugins: {
			import: fixupPluginRules(_import),
			"@stylistic": stylistic,
		},
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},

			ecmaVersion: "latest",
			sourceType: "module",
		},
		rules: {
			"consistent-return": "off",
			"func-names": "off",
			"max-len": "off",
			"no-console": [ "error", { allow: [ "warn", "error" ] } ],
			"no-param-reassign": [
				"error",
				{ props: false },
			],
			"no-shadow": [
				"error",
				{
					hoist: "all",
					allow: [ "resolve", "reject", "done", "next", "err", "error" ],
				},
			],
			"no-underscore-dangle": "off",
			"no-unused-expressions": "warn",
			"no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "res|next|^err" },
			],
			radix: "off",
			"import/extensions": "off",
			"@stylistic/array-bracket-newline": [ "error", { multiline: true } ],
			"@stylistic/array-bracket-spacing": [ "error", "always" ],
			"@stylistic/array-element-newline": [ "error", "consistent" ],
			"@stylistic/arrow-parens": [ "error", "as-needed" ],
			"@stylistic/arrow-spacing": "error",
			"@stylistic/brace-style": [ "error", "stroustrup" ],
			"@stylistic/comma-dangle": [ "error", "always-multiline" ],
			"@stylistic/comma-spacing": "error",
			"@stylistic/comma-style": "error",
			"@stylistic/curly-newline": [ "error", "always" ],
			"@stylistic/eol-last": [ "error", "always" ],
			"@stylistic/function-call-argument-newline": [ "error", "consistent" ],
			"@stylistic/function-call-spacing": "error",
			"@stylistic/function-paren-newline": [ "error", "multiline-arguments" ],
			"@stylistic/indent": [ "error", "tab" ],
			"@stylistic/key-spacing": "error",
			"@stylistic/keyword-spacing": [
				"error", {
					overrides: {
						if: { after: false },
						for: { after: false },
						while: { after: false },
						static: { after: false },
						as: { after: false },
					},
				},
			],
			"@stylistic/linebreak-style": "error",
			"@stylistic/lines-between-class-members": "error",
			"@stylistic/max-statements-per-line": [ "error", { max: 1 } ],
			"@stylistic/no-extra-semi": "error",
			"@stylistic/no-floating-decimal": "error",
			"@stylistic/no-mixed-operators": "error",
			"@stylistic/no-trailing-spaces": [ "error" ],
			"@stylistic/object-curly-newline": [ "error", { multiline: true } ],
			"@stylistic/object-curly-spacing": [ "error", "always" ],
			"@stylistic/object-property-newline": [ "error", { allowAllPropertiesOnSameLine: true } ],
			"@stylistic/padded-blocks": [ "error", "never" ],
			"@stylistic/quote-props": [ "error", "as-needed" ],
			"@stylistic/quotes": [ "error", "double", { allowTemplateLiterals: "always" } ],
			"@stylistic/semi": [ "error", "always" ],
			"@stylistic/semi-spacing": [ "error", { before: false, after: true } ],
			"@stylistic/space-before-blocks": [ "error", "always" ],
			"@stylistic/space-before-function-paren": [ "error", "never" ],
			"@stylistic/space-in-parens": [ "error", "never" ],
			"@stylistic/space-infix-ops": "error",
			"@stylistic/space-unary-ops": "error",
			"@stylistic/switch-colon-spacing": [ "error", { after: true, before: false } ],
			"@stylistic/template-tag-spacing": [ "error", "never" ],
		},
	},
]);
