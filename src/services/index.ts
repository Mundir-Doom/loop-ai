/**
 * Services Index
 * Central export point for all services
 */

export { GoogleSheetsService } from './GoogleSheetsService';
export type { SheetRow, SheetData } from './GoogleSheetsService';

export { KnowledgeBaseService } from './KnowledgeBaseService';
export type { RelevanceCheck } from './KnowledgeBaseService';

export { ChatService } from './ChatService';
export type { ChatMessage, ChatServiceConfig } from './ChatService';

export { TelegramService } from './TelegramService';
export type { SupportTicket } from './TelegramService';

export { SupportTicketService } from './SupportTicketService';
export type { TicketStep, TicketData, TicketFlowState } from './SupportTicketService';

export { FriendlyResponseService } from './FriendlyResponseService';
export type { FriendlyResponse } from './FriendlyResponseService';

export { AssistanceService } from './AssistanceService';
export type { AssistanceAttempt } from './AssistanceService';

export { LanguageService } from './LanguageService';
export type { Language, LanguageDetection } from './LanguageService';
