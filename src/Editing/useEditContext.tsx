import * as React from 'react';
import EditController from './EditController';
import { EditContext } from './EditProvider';

export const useEditContext = (): EditController => React.useContext(EditContext);
