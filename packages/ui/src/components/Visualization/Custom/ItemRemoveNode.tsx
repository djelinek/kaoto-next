import { MinusIcon } from '@patternfly/react-icons';
import { ContextMenuItem, ElementContext, ElementModel, GraphElement } from '@patternfly/react-topology';
import { FunctionComponent, useCallback, useContext, useMemo } from 'react';
import { IDataTestID } from '../../../models';
import { EntitiesContext } from '../../../providers/entities.provider';
import { CanvasNode } from '../Canvas/canvas.models';

export const ItemRemoveNode: FunctionComponent<IDataTestID> = (props) => {
  const entitiesContext = useContext(EntitiesContext);
  const element: GraphElement<ElementModel, CanvasNode['data']> = useContext(ElementContext);
  const vizNode = element.getData()?.vizNode;
  const shouldRender = useMemo(() => vizNode?.getNodeInteraction()?.canRemoveStep ?? false, [vizNode]);

  const onRemoveNode = useCallback(() => {
    vizNode?.removeChild();
    entitiesContext?.updateEntitiesFromCamelResource();
  }, [entitiesContext, vizNode]);

  return shouldRender ? (
    <ContextMenuItem onClick={onRemoveNode} data-testid={props['data-testid']}>
      <MinusIcon /> Remove {vizNode?.id} node
    </ContextMenuItem>
  ) : null;
};
