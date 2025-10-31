/**
 * Type definitions for react-telegram-login
 * Package: react-telegram-login
 */

declare module 'react-telegram-login' {
  import { Component } from 'react';

  export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
  }

  export interface TelegramLoginButtonProps {
    botName: string;
    dataOnauth: (user: TelegramUser) => void;
    buttonSize?: 'large' | 'medium' | 'small';
    cornerRadius?: number;
    requestAccess?: string;
    usePic?: boolean;
    lang?: string;
    className?: string;
  }

  export default class TelegramLoginButton extends Component<TelegramLoginButtonProps> {}
}
