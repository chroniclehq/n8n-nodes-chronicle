import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import { chronicleApiRequest, extractChronicleErrorMessage } from '../shared/transport';
import { uploadToS3, type CreateTargetResponse } from './uploadToS3';

export async function upload(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const fieldName = this.getNodeParameter('input_data_field_name', i, 'data') as string;
			const binary = this.helpers.assertBinaryData(i, fieldName);
			const buffer = await this.helpers.getBinaryDataBuffer(i, fieldName);

			const fileName = binary.fileName ?? 'upload';
			const contentType = binary.mimeType ?? 'application/octet-stream';

			const target = (await chronicleApiRequest.call(
				this,
				'POST',
				'/api/v1/uploads/create-target',
				{
					file_name: fileName,
					content_type: contentType,
					declared_file_size: buffer.byteLength,
				},
			)) as CreateTargetResponse;

			await uploadToS3(this.helpers, target, buffer, binary);

			returnData.push({
				json: {
					id: target.path,
					url: target.download_url,
					file_name: fileName,
					type: contentType,
				},
				pairedItem: { item: i },
			});
		} catch (error) {
			const chronicleMessage = extractChronicleErrorMessage(error);
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: chronicleMessage ?? (error as Error).message },
					pairedItem: { item: i },
				});
				continue;
			}
			if (error instanceof NodeApiError || error instanceof NodeOperationError) {
				// eslint-disable-next-line @n8n/community-nodes/require-node-api-error
				throw error;
			}
			throw new NodeApiError(
				this.getNode(),
				{ message: chronicleMessage ?? (error as Error).message },
				{ itemIndex: i },
			);
		}
	}

	return [returnData];
}
