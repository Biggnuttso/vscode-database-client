import { ConnectionManager } from "@/service/connectionManager";
import { QueryUnit } from "@/service/queryUnit";
import { Global } from "../../common/global";
import { ViewManager } from "../../common/viewManager";
import { ConnectionNode } from "../../model/database/connectionNode";
import { StatusService } from "./statusService";

export abstract class AbstractStatusService implements StatusService {

    protected abstract onDashBoard(connectionNode: ConnectionNode): DashBoardResponse | Promise<DashBoardResponse>;

    public show(connectionNode: ConnectionNode): void | Promise<void> {
        ViewManager.createWebviewPanel({
            path: "app",
            splitView: false, title: "Server Status",
            iconPath: Global.getExtPath("resources", "icon", "state.svg"),
            eventHandler: (handler) => {
                handler.on("init", () => {
                    handler.emit('route', 'status')
                }).on("processList", async () => {
                    QueryUnit.queryPromise<any>(await ConnectionManager.getConnection(connectionNode), connectionNode.dialect.processList()).then(({ rows, fields }) => {
                        handler.emit("processList", { fields, rows })
                    })
                }).on("variableList", async () => {
                    QueryUnit.queryPromise<any>(await ConnectionManager.getConnection(connectionNode), connectionNode.dialect.variableList()).then(({ rows, fields }) => {
                        handler.emit("variableList", { fields, rows })
                    })
                }).on("statusList", async () => {
                    QueryUnit.queryPromise<any>(await ConnectionManager.getConnection(connectionNode), connectionNode.dialect.statusList()).then(({ rows, fields }) => {
                        handler.emit("statusList", { fields, rows })
                    })
                }).on("dashBoard", async () => {
                    const dashBoard = await this.onDashBoard(connectionNode)
                    handler.emit("dashBoard", { ...dashBoard })
                })
            }
        })
    }

}

export interface DashBoardItem {
    now: any;
    type: string;
    value: number
}

export interface DashBoardResponse {
    sessions: DashBoardItem[],
    queries: DashBoardItem[],
    traffic: DashBoardItem[],
}
