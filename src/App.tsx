import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import autoAnimate from '@formkit/auto-animate';
import { Minus, Plus, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Item {
  id: string;
  content: string;
  category: 'Action' | 'Drama' | 'Comedy';
}

const STORAGE_KEY = 'dragDropItems';

const DragAndDrop: React.FC = () => {
  const parent = useRef(null);

  useEffect(() => {
    if (parent.current) {
      autoAnimate(parent.current);
    }
  }, [parent]);

  const [items] = useState<Item[]>([
    {
      id: 'item1',
      content:
        '"I\'m going to make him an offer he can\'t refuse" - The Godfather',
      category: 'Drama'
    },
    {
      id: 'item2',
      content: '"The name\'s Bond. James Bond." - James Bond',
      category: 'Action'
    },
    {
      id: 'item3',
      content: '"I feel the need... the need for speed!" - Top Gun',
      category: 'Action'
    },
    {
      id: 'item4',
      content: '"May the Force be with you" - Star Wars',
      category: 'Action'
    },
    {
      id: 'item5',
      content: '"You can\'t handle the truth!" - A Few Good Men',
      category: 'Drama'
    },
    {
      id: 'item6',
      content: '"I\'ll be back" - The Terminator',
      category: 'Action'
    },
    {
      id: 'item7',
      content: '"I see dead people" - The Sixth Sense',
      category: 'Drama'
    },
    {
      id: 'item8',
      content: '"Bean. Mr. Bean" - Bean: The Ultimate Disaster Movie',
      category: 'Comedy'
    },
    {
      id: 'item9',
      content: '"Not quite my tempo" - Whiplash',
      category: 'Drama'
    },
    {
      id: 'item10',
      content:
        '"Maybe that\'s what hell is: the entire rest of eternity spent in Bruges" - In Bruges',
      category: 'Comedy'
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Action', 'Drama', 'Comedy'])
  );

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

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  return (
    <div className='p-6 bg-gray-100 min-h-screen'>
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='text-3xl font-bold text-center text-gray-800'>
            Native Drag and Drop
          </CardTitle>
        </CardHeader>
      </Card>
      <div className='flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8'>
        <Card className='w-full md:w-1/2'>
          <CardHeader>
            <CardTitle className='text-xl font-semibold text-gray-700'>
              Draggable Movie Quotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className='h-[70vh]'>
              {['Action', 'Drama', 'Comedy'].map((category) => (
                <div key={category} className='mb-4 '>
                  <Button
                    variant='outline'
                    className='w-full justify-between mb-2 bg-black text-white hover:bg-gray-700 hover:text-white'
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                    {expandedCategories.has(category) ? (
                      <Minus size={16} />
                    ) : (
                      <Plus size={16} />
                    )}
                  </Button>
                  {expandedCategories.has(category) && (
                    <div className='space-y-3 pl-4'>
                      {items
                        .filter((item) => item.category === category)
                        .map((item) => (
                          <TooltipProvider key={item.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className='p-4 bg-white shadow-sm rounded-lg cursor-move hover:shadow-md transition-all duration-300'
                                  draggable
                                  onDragStart={(e) => onDragStart(e, item.id)}
                                >
                                  {item.content.substring(0, 85)}{' '}
                                  {item.content.length > 85 ? '...' : ''}
                                </div>
                              </TooltipTrigger>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className='w-full md:w-1/2'>
          <CardHeader></CardHeader>

          <CardContent>
            <div
              id='drop-zone'
              className={`p-6 h-[70vh] bg-blue-50 border-2 border-dashed rounded-lg flex flex-col items-center transition-all duration-300 ${
                isDraggingOver
                  ? 'border-blue-500 bg-blue-100'
                  : 'border-blue-300'
              }`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
            >
              <ScrollArea className='w-full h-full '>
                {droppedItems.length === 0 ? (
                  <p className='text-blue-500 text-lg text-center my-auto  h-full flex items-center justify-center'>
                    Drop items here
                  </p>
                ) : (
                  <div className='space-y-3 w-full' ref={parent}>
                    {droppedItems.map((item) => (
                      <div
                        key={item.id}
                        className='p-3 bg-white shadow-sm border border-blue-200 rounded-md flex justify-between items-center dropped-item hover:shadow-md transition-all duration-300'
                        draggable
                        onDragStart={(e) => onDragStart(e, item.id)}
                      >
                        <span className='text-gray-700'>{item.content}</span>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => removeItem(item.id)}
                          className='text-red-500 hover:text-red-700 focus:outline-none'
                        >
                          <X size={18} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DragAndDrop;
