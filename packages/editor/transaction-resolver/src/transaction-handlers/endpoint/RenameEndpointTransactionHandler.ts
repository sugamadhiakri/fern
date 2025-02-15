import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class RenameEndpointTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.RenameEndpointTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.RenameEndpointTransaction): void {
        const endpoint = this.getEndpointOrThrow(transaction.endpointId);
        endpoint.endpointName = transaction.newEndpointName;
    }
}
