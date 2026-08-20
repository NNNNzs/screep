export interface StoreSnapshot {
  id: string;
  structureType: StructureConstant;
  x: number;
  y: number;
  energy: number;
  freeCapacity: number;
}

export interface SourceSnapshot {
  id: string;
  x: number;
  y: number;
  energy: number;
  energyCapacity: number;
  containerId?: string;
  linkId?: string;
  harvestPositions: HarvestPosition[];
}

export interface HarvestPosition {
  x: number;
  y: number;
}

export interface RoomSnapshot {
  roomName: string;
  controllerId?: string;
  controllerLevel: number;
  controllerTicksToDowngrade?: number;
  sources: SourceSnapshot[];
  stores: StoreSnapshot[];
  constructionSites: Array<{ id: string; x: number; y: number; progress: number; progressTotal: number; structureType: BuildableStructureConstant }>;
  damagedStructureIds: string[];
  hostileCount: number;
  injuredCreepIds: string[];
}
