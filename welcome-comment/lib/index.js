"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function run() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const labels = (_a = core.getInput("labels"), (_a !== null && _a !== void 0 ? _a : ""))
            .split(",")
            .map(s => s.trim())
            .filter(s => !!s);
        core.debug(`labels: ${JSON.stringify(labels)}`);
        const githubToken = core.getInput("github-token");
        const octokit = new github.GitHub(githubToken);
        const { context } = github;
        const issue = yield octokit.issues.get(context.issue);
        function matchLabel(label, issueLabel) {
            if (`${issueLabel.id}` === label) {
                return true;
            }
            else if (issueLabel.node_id === label) {
                return true;
            }
            else if (issueLabel.name === label) {
                return true;
            }
            return false;
        }
        if (!labels.every(label => issue.data.labels.some(issueLabel => matchLabel(label, issueLabel)))) {
            core.debug(`some labels doesn't contains on issue labels.`);
            return;
        }
        octokit.issues.createComment(Object.assign(Object.assign({}, context.issue), { body: core.getInput("message") }));
    });
}
run().catch(err => core.setFailed(err.message));
