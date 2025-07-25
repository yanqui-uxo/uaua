export default class RecordingIdentifier<NodeParams extends unknown[]> {
  private _nodeParams: NodeParams;

  get nodeParams(): NodeParams {
    return this._nodeParams;
  }

  constructor(nodeParams: NodeParams) {
    this._nodeParams = nodeParams;
  }
}
