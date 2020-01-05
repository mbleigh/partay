export type GameType = "sketcharound";
export type PageType = "home" | "host" | "play";

export interface State {
  page?: PageType;
  user?: User;
  code?: string;
  data?: RoomData;
}

export interface User {
  uid: string;
  name?: string;
  photo?: string;
}

export interface RoomData<T = any> {
  game: GameType;
  host: string | null;
  create_time: number;
  update_time: number;
  state: any;
  players: {[uid: string]: PlayerData};
}

export type PlayerStatus = 'active' | 'away' | 'left';

export interface PlayerData<T = any> {
  uid?: string;
  status: PlayerStatus;
  join_time: number;
  disconnect_time?: number;
  leave_time?: number;
  name: string;
  data: T;
}
