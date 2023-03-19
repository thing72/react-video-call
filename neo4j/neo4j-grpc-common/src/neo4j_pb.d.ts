// package: neo4j
// file: neo4j.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class CreateUserRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): CreateUserRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateUserRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateUserRequest): CreateUserRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateUserRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateUserRequest;
    static deserializeBinaryFromReader(message: CreateUserRequest, reader: jspb.BinaryReader): CreateUserRequest;
}

export namespace CreateUserRequest {
    export type AsObject = {
        userId: string,
    }
}

export class CreateUserResponse extends jspb.Message { 
    getError(): boolean;
    setError(value: boolean): CreateUserResponse;
    getMessage(): string;
    setMessage(value: string): CreateUserResponse;
    getPriority(): string;
    setPriority(value: string): CreateUserResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateUserResponse.AsObject;
    static toObject(includeInstance: boolean, msg: CreateUserResponse): CreateUserResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateUserResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateUserResponse;
    static deserializeBinaryFromReader(message: CreateUserResponse, reader: jspb.BinaryReader): CreateUserResponse;
}

export namespace CreateUserResponse {
    export type AsObject = {
        error: boolean,
        message: string,
        priority: string,
    }
}

export class CreateMatchRequest extends jspb.Message { 
    getUserId1(): string;
    setUserId1(value: string): CreateMatchRequest;
    getUserId2(): string;
    setUserId2(value: string): CreateMatchRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateMatchRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateMatchRequest): CreateMatchRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateMatchRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateMatchRequest;
    static deserializeBinaryFromReader(message: CreateMatchRequest, reader: jspb.BinaryReader): CreateMatchRequest;
}

export namespace CreateMatchRequest {
    export type AsObject = {
        userId1: string,
        userId2: string,
    }
}

export class CreateMatchResponse extends jspb.Message { 
    getError(): boolean;
    setError(value: boolean): CreateMatchResponse;
    getMessage(): string;
    setMessage(value: string): CreateMatchResponse;
    getUserId1(): string;
    setUserId1(value: string): CreateMatchResponse;
    getUserId2(): string;
    setUserId2(value: string): CreateMatchResponse;
    getRelationshipId1(): string;
    setRelationshipId1(value: string): CreateMatchResponse;
    getRelationshipId2(): string;
    setRelationshipId2(value: string): CreateMatchResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateMatchResponse.AsObject;
    static toObject(includeInstance: boolean, msg: CreateMatchResponse): CreateMatchResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateMatchResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateMatchResponse;
    static deserializeBinaryFromReader(message: CreateMatchResponse, reader: jspb.BinaryReader): CreateMatchResponse;
}

export namespace CreateMatchResponse {
    export type AsObject = {
        error: boolean,
        message: string,
        userId1: string,
        userId2: string,
        relationshipId1: string,
        relationshipId2: string,
    }
}

export class UpdateMatchRequest extends jspb.Message { 
    getRelationshipId(): string;
    setRelationshipId(value: string): UpdateMatchRequest;
    getKey(): string;
    setKey(value: string): UpdateMatchRequest;
    getValue(): string;
    setValue(value: string): UpdateMatchRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateMatchRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateMatchRequest): UpdateMatchRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateMatchRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateMatchRequest;
    static deserializeBinaryFromReader(message: UpdateMatchRequest, reader: jspb.BinaryReader): UpdateMatchRequest;
}

export namespace UpdateMatchRequest {
    export type AsObject = {
        relationshipId: string,
        key: string,
        value: string,
    }
}

export class UpdateMatchResponse extends jspb.Message { 
    getError(): boolean;
    setError(value: boolean): UpdateMatchResponse;
    getMessage(): string;
    setMessage(value: string): UpdateMatchResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateMatchResponse.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateMatchResponse): UpdateMatchResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateMatchResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateMatchResponse;
    static deserializeBinaryFromReader(message: UpdateMatchResponse, reader: jspb.BinaryReader): UpdateMatchResponse;
}

export namespace UpdateMatchResponse {
    export type AsObject = {
        error: boolean,
        message: string,
    }
}

export class GetRelationshipScoresRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetRelationshipScoresRequest;
    clearOtherUsersList(): void;
    getOtherUsersList(): Array<string>;
    setOtherUsersList(value: Array<string>): GetRelationshipScoresRequest;
    addOtherUsers(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetRelationshipScoresRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetRelationshipScoresRequest): GetRelationshipScoresRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetRelationshipScoresRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetRelationshipScoresRequest;
    static deserializeBinaryFromReader(message: GetRelationshipScoresRequest, reader: jspb.BinaryReader): GetRelationshipScoresRequest;
}

export namespace GetRelationshipScoresRequest {
    export type AsObject = {
        userId: string,
        otherUsersList: Array<string>,
    }
}

export class GetRelationshipScoresResponse extends jspb.Message { 
    getError(): boolean;
    setError(value: boolean): GetRelationshipScoresResponse;
    getMessage(): string;
    setMessage(value: string): GetRelationshipScoresResponse;

    getRelationshipScoresMap(): jspb.Map<string, number>;
    clearRelationshipScoresMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetRelationshipScoresResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetRelationshipScoresResponse): GetRelationshipScoresResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetRelationshipScoresResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetRelationshipScoresResponse;
    static deserializeBinaryFromReader(message: GetRelationshipScoresResponse, reader: jspb.BinaryReader): GetRelationshipScoresResponse;
}

export namespace GetRelationshipScoresResponse {
    export type AsObject = {
        error: boolean,
        message: string,

        relationshipScoresMap: Array<[string, number]>,
    }
}

export class CheckUserFiltersRequest extends jspb.Message { 
    getUserId1(): string;
    setUserId1(value: string): CheckUserFiltersRequest;
    getUserId2(): string;
    setUserId2(value: string): CheckUserFiltersRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CheckUserFiltersRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CheckUserFiltersRequest): CheckUserFiltersRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CheckUserFiltersRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CheckUserFiltersRequest;
    static deserializeBinaryFromReader(message: CheckUserFiltersRequest, reader: jspb.BinaryReader): CheckUserFiltersRequest;
}

export namespace CheckUserFiltersRequest {
    export type AsObject = {
        userId1: string,
        userId2: string,
    }
}

export class CheckUserFiltersResponse extends jspb.Message { 
    getError(): boolean;
    setError(value: boolean): CheckUserFiltersResponse;
    getMessage(): string;
    setMessage(value: string): CheckUserFiltersResponse;
    getPassed(): boolean;
    setPassed(value: boolean): CheckUserFiltersResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CheckUserFiltersResponse.AsObject;
    static toObject(includeInstance: boolean, msg: CheckUserFiltersResponse): CheckUserFiltersResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CheckUserFiltersResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CheckUserFiltersResponse;
    static deserializeBinaryFromReader(message: CheckUserFiltersResponse, reader: jspb.BinaryReader): CheckUserFiltersResponse;
}

export namespace CheckUserFiltersResponse {
    export type AsObject = {
        error: boolean,
        message: string,
        passed: boolean,
    }
}