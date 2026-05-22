/**
 * node-zklib decodeRecordData40 omits verify state/type (ZK protocol offsets 26 & 31).
 * Must load before node-zklib so TCP attendance logs include state.
 */
const zkUtils = require('node-zklib/utils');

const decodeRecordData40Original = zkUtils.decodeRecordData40;

zkUtils.decodeRecordData40 = (recordData) => {
  const record = decodeRecordData40Original(recordData);
  record.verifyType = recordData.readUIntLE(26, 1);
  record.state = recordData.readUIntLE(31, 1);
  return record;
};
