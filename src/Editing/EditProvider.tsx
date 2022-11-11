import * as React from 'react';
import EditController from './EditController';

interface EditProviderProps {
  children: React.ReactNode;
}

// Special case. To avoid unnecessry querying, the Editor Widget is NOT inizialized via the EditController constructor. It is inizialized 'manually' from EditEsriElement.tsx when the element is expanded for the first time.
const editController = EditController.getInstance();

export const EditContext = React.createContext<EditController>(editController);

export const EditProvider: React.FC<EditProviderProps> = ({ children }) => {
    return <EditContext.Provider value={editController}>{children}</EditContext.Provider>;
};
