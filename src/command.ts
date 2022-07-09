import * as vscode from "vscode";

const vscodeVariables = require('vscode-variables');

export class Command {
    constructor(
        private readonly exe: string,
        private readonly args: object | undefined,
        private readonly onSuccess: Array<Command> | undefined,
        private readonly onFail: Array<Command> | undefined,
        private readonly variableSubstitution: boolean
    ) {}

    public async execute() {
        try {
            if (this.args) {
                if (this.variableSubstitution) {
                    await vscode.commands.executeCommand(this.exe, this.substituteVariables(this.args));
                } else {
                    await vscode.commands.executeCommand(this.exe, this.args);
                }
            } else {
                await vscode.commands.executeCommand(this.exe);
            }
            if (this.onSuccess) {
                for (let command of this.onSuccess) {
                    await command.execute();
                }
            }
        } catch(e) {
            if (this.onFail) {
                for (let command of this.onFail) {
                    await command.execute();
                }
            } else {
                throw(e);
           }
        }
    }

    private substituteVariables(args: any ): any {
        if (typeof args === 'string') {
            args = args.replace(/\${userHome}/g, process.env['HOME'] || '');
            return vscodeVariables(args);
        } else if (typeof args === 'object') {
            let rt: any = {};
            for(const key of Object.keys(args)) {
                rt[key] = this.substituteVariables(args[key]);
            }
            return rt;
        } else {
            return args;
        }
    }
    
}
