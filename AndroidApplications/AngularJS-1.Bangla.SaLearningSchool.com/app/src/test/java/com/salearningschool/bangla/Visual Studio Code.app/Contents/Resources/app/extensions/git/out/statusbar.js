/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const git_1 = require("./git");
const repository_1 = require("./repository");
const util_1 = require("./util");
const nls = require("vscode-nls");
const localize = nls.loadMessageBundle(__filename);
class CheckoutStatusBar {
    constructor(repository) {
        this.repository = repository;
        this._onDidChange = new vscode_1.EventEmitter();
        this.disposables = [];
        repository.onDidChangeStatus(this._onDidChange.fire, this._onDidChange, this.disposables);
    }
    get onDidChange() { return this._onDidChange.event; }
    get command() {
        const HEAD = this.repository.HEAD;
        if (!HEAD) {
            return undefined;
        }
        const tag = this.repository.refs.filter(iref => iref.type === git_1.RefType.Tag && iref.commit === HEAD.commit)[0];
        const tagName = tag && tag.name;
        const head = HEAD.name || tagName || (HEAD.commit || '').substr(0, 8);
        const title = '$(git-branch) '
            + head
            + (this.repository.workingTreeGroup.resourceStates.length > 0 ? '*' : '')
            + (this.repository.indexGroup.resourceStates.length > 0 ? '+' : '')
            + (this.repository.mergeGroup.resourceStates.length > 0 ? '!' : '');
        return {
            command: 'git.checkout',
            tooltip: localize(0, null),
            title,
            arguments: [this.repository.sourceControl]
        };
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
class SyncStatusBar {
    constructor(repository) {
        this.repository = repository;
        this._onDidChange = new vscode_1.EventEmitter();
        this.disposables = [];
        this._state = SyncStatusBar.StartState;
        repository.onDidChangeStatus(this.onModelChange, this, this.disposables);
        repository.onDidChangeOperations(this.onOperationsChange, this, this.disposables);
        this._onDidChange.fire();
    }
    get onDidChange() { return this._onDidChange.event; }
    get state() { return this._state; }
    set state(state) {
        this._state = state;
        this._onDidChange.fire();
    }
    onOperationsChange() {
        this.state = Object.assign({}, this.state, { isSyncRunning: this.repository.operations.isRunning(repository_1.Operation.Sync) });
    }
    onModelChange() {
        this.state = Object.assign({}, this.state, { hasRemotes: this.repository.remotes.length > 0, HEAD: this.repository.HEAD });
    }
    get command() {
        if (!this.state.hasRemotes) {
            return undefined;
        }
        const HEAD = this.state.HEAD;
        let icon = '$(sync)';
        let text = '';
        let command = '';
        let tooltip = '';
        if (HEAD && HEAD.name && HEAD.commit) {
            if (HEAD.upstream) {
                if (HEAD.ahead || HEAD.behind) {
                    text += `${HEAD.behind}↓ ${HEAD.ahead}↑`;
                }
                command = 'git.sync';
                tooltip = localize(1, null);
            }
            else {
                icon = '$(cloud-upload)';
                command = 'git.publish';
                tooltip = localize(2, null);
            }
        }
        else {
            command = '';
            tooltip = '';
        }
        if (this.state.isSyncRunning) {
            icon = '$(sync~spin)';
            command = '';
            tooltip = localize(3, null);
        }
        return {
            command,
            title: [icon, text].join(' ').trim(),
            tooltip,
            arguments: [this.repository.sourceControl]
        };
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
SyncStatusBar.StartState = {
    isSyncRunning: false,
    hasRemotes: false,
    HEAD: undefined
};
class StatusBarCommands {
    constructor(repository) {
        this.disposables = [];
        this.syncStatusBar = new SyncStatusBar(repository);
        this.checkoutStatusBar = new CheckoutStatusBar(repository);
    }
    get onDidChange() {
        return util_1.anyEvent(this.syncStatusBar.onDidChange, this.checkoutStatusBar.onDidChange);
    }
    get commands() {
        const result = [];
        const checkout = this.checkoutStatusBar.command;
        if (checkout) {
            result.push(checkout);
        }
        const sync = this.syncStatusBar.command;
        if (sync) {
            result.push(sync);
        }
        return result;
    }
    dispose() {
        this.syncStatusBar.dispose();
        this.checkoutStatusBar.dispose();
        this.disposables = util_1.dispose(this.disposables);
    }
}
exports.StatusBarCommands = StatusBarCommands;
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/27492b6bf3acb0775d82d2f87b25a93490673c6d/extensions/git/out/statusbar.js.map