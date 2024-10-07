import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Item {
  id: string;
  content: string;
}

const STORAGE_KEY = 'dragDropItems';

const DragAndDrop: React.FC = () => {
  const [items] = useState<Item[]>([
    {
      id: 'item1',
      content:
        '1. "I\'m going to make him an offer he can\'t refuse" - The Godfather'
    },
    {
      id: 'item2',
      content: '2. "The name\'s Bond. James Bond." - Various James Bond films'
    },
    {
      id: 'item3',
      content: '3. "Shaken, not stirred" - Various James Bond films'
    },
    { id: 'item4', content: '4. "May the Force be with you" - Star Wars' },
    {
      id: 'item5',
      content: '5. "You can\'t handle the truth!" - A Few Good Men'
    },
    { id: 'item6', content: '6. "I\'ll be back" - The Terminator' },
    { id: 'item7', content: '7. "I see dead people" - The Sixth Sense' },
    {
      id: 'item8',
      content: '8. "Bean. Mr. Bean" - Bean: The Ultimate Disaster Movie'
    },
    { id: 'item9', content: '9. "Not quite my tempo" - Whiplash' },
    {
      id: 'item10',
      content:
        '10. "Maybe that\'s what hell is: the entire rest of eternity spent in Bruges" - In Bruges'
    }
  ]);

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [droppedItems, setDroppedItems] = useState<Item[]>(() => {
    try {
      const savedItems = localStorage.getItem(STORAGE_KEY);
      return savedItems ? JSON.parse(savedItems) : [];
    } catch (error) {
      console.error('Failed to parse dropped items from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(droppedItems));
  }, [droppedItems]);

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const id = e.dataTransfer.getData('text');
    const draggedFromDropZone = droppedItems.some((item) => item.id === id);

    const draggedItem = draggedFromDropZone
      ? droppedItems.find((item) => item.id === id)
      : items.find((item) => item.id === id);

    if (draggedItem) {
      const dropIndex = getDropIndex(e.clientY);
      const newItem = draggedFromDropZone
        ? { ...draggedItem }
        : { ...draggedItem, id: uuidv4() };

      setDroppedItems((prevItems) => {
        if (draggedFromDropZone) {
          const filteredItems = prevItems.filter((item) => item.id !== id);
          return [
            ...filteredItems.slice(0, dropIndex),
            newItem,
            ...filteredItems.slice(dropIndex)
          ];
        } else {
          return [
            ...prevItems.slice(0, dropIndex),
            newItem,
            ...prevItems.slice(dropIndex)
          ];
        }
      });
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const onDragLeave = () => {
    setIsDraggingOver(false);
  };

  const getDropIndex = (y: number): number => {
    const dropZone = document.getElementById('drop-zone');
    if (!dropZone) return 0;

    const dropZoneRect = dropZone.getBoundingClientRect();
    const relativeY = y - dropZoneRect.top;

    const droppedItemElements = dropZone.querySelectorAll('.dropped-item');
    for (let i = 0; i < droppedItemElements.length; i++) {
      const rect = droppedItemElements[i].getBoundingClientRect();
      const itemRelativeY = rect.top - dropZoneRect.top;
      if (relativeY < itemRelativeY + rect.height / 2) {
        return i;
      }
    }
    return droppedItemElements.length;
  };

  const removeItem = (id: string) => {
    setDroppedItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  return (
    <div className='p-6 bg-gray-100 min-h-screen'>
      <h2 className='text-3xl font-bold mb-8 text-center text-gray-800'>
        Native Drag and Drop
      </h2>
      <div className='flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8'>
        <div className='w-full md:w-1/2'>
          <h3 className='text-xl font-semibold mb-4 text-gray-700'>
            Draggable Items
          </h3>
          <div className='space-y-3'>
            {items.map((item) => (
              <div
                key={item.id}
                className='p-4 bg-white shadow-md rounded-lg cursor-move hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1'
                draggable
                onDragStart={(e) => onDragStart(e, item.id)}
              >
                {item.content}
              </div>
            ))}
          </div>
        </div>
        <div className='w-full md:w-1/2'>
          <h3 className='text-xl font-semibold mb-4 text-gray-700'>
            Drop Zone
          </h3>
          <div
            id='drop-zone'
            className={`p-6 min-h-[16rem] bg-blue-50 border-2 border-dashed rounded-lg flex flex-col items-center  transition-all duration-300 ${
              isDraggingOver ? 'border-blue-500 bg-blue-100' : 'border-blue-300'
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            {droppedItems.length === 0 ? (
              <p className='text-blue-500 text-lg my-auto'>Drop items here</p>
            ) : (
              <div className='space-y-3 w-full'>
                {droppedItems.map((item) => (
                  <div
                    key={item.id}
                    className='p-3 bg-white shadow-sm border border-blue-200 rounded-md flex justify-between items-center dropped-item hover:shadow-md transition-all duration-300'
                    draggable
                    onDragStart={(e) => onDragStart(e, item.id)}
                  >
                    <span className='text-gray-700'>{item.content}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className='text-red-500 hover:text-red-700 focus:outline-none transition-colors duration-300'
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragAndDrop;
