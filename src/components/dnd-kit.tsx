import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Item {
  id: string;
  content: string;
}

const STORAGE_KEY = 'dndKitDroppedItems';

const SortableItem: React.FC<{ id: string; children: React.ReactNode }> = ({
  id,
  children
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const DragAndDrop: React.FC = () => {
  const [items] = useState<Item[]>([
    { id: 'item1', content: 'Item 1' },
    { id: 'item2', content: 'Item 2' },
    { id: 'item3', content: 'Item 3' },
    { id: 'item4', content: 'Item 4' },
    { id: 'item5', content: 'Item 5' },
    { id: 'item6', content: 'Item 6' }
  ]);

  const [droppedItems, setDroppedItems] = useState<Item[]>(() => {
    const savedItems = localStorage.getItem(STORAGE_KEY);
    return savedItems ? JSON.parse(savedItems) : [];
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(droppedItems));
  }, [droppedItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragStart = (event: { active: { id: string } }) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: {
    active: { id: string };
    over: { id: string } | null;
  }) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setDroppedItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const onDrop = (id: string) => {
    const draggedItem =
      items.find((item) => item.id === id) ||
      droppedItems.find((item) => item.id === id);
    if (draggedItem) {
      const newItem: Item = { ...draggedItem, id: uuidv4() };
      setDroppedItems((prevItems) => [...prevItems, newItem]);
    }
  };

  const removeItem = (id: string) => {
    setDroppedItems((items) => items.filter((item) => item.id !== id));
  };

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4'>Drag and Drop Demo</h2>
      <div className='flex space-x-8'>
        <div className='w-1/2'>
          <h3 className='text-lg font-semibold mb-2'>Draggable Items</h3>
          <DndContext
            sensors={sensors}
            onDragEnd={({ active }) => onDrop(active.id)}
          >
            <div className='space-y-2 w-full'>
              {items.map((item) => (
                <SortableItem key={item.id} id={item.id}>
                  <div className='p-3 bg-gray-100 border border-gray-300 rounded cursor-move hover:bg-gray-200 transition-colors'>
                    {item.content}
                  </div>
                </SortableItem>
              ))}
            </div>
          </DndContext>
        </div>
        <div className='w-1/2'>
          <h3 className='text-lg font-semibold mb-2'>Drop Zone</h3>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className='p-4 min-h-48 bg-blue-100 border-2 border-dashed border-blue-300 rounded flex flex-col items-center justify-center'>
              {droppedItems.length === 0 ? (
                <p className='text-blue-500'>Drop items here</p>
              ) : (
                <SortableContext
                  items={droppedItems}
                  strategy={verticalListSortingStrategy}
                >
                  {droppedItems.map((item) => (
                    <SortableItem key={item.id} id={item.id}>
                      <div className='p-2 mb-2 bg-white w-full border border-blue-300 rounded flex justify-between items-center'>
                        <span>{item.content}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className='text-red-500 hover:text-red-700 focus:outline-none'
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </SortableItem>
                  ))}
                </SortableContext>
              )}
            </div>
            <DragOverlay>
              {activeId ? (
                <div className='p-2 bg-white border border-blue-300 rounded flex justify-between items-center opacity-50'>
                  {droppedItems.find((item) => item.id === activeId)?.content}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default DragAndDrop;
