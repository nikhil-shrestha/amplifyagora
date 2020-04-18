import { format } from 'date-fns';

export const convertDollarsToCents = (price) => (price * 100).toFixed(0);

export const convertCentsToDollar = (price) => (price / 100).toFixed(2);

export const formatProductDate = (date) =>
  format(new Date(date), 'MMM do, yyyy');

export const formatOrderDate = (date) =>
  format(new Date(date), 'eee h:mm a, MMM do, yyyy');
