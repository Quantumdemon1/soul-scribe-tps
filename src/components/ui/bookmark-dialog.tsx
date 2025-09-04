import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useToast } from '@/hooks/use-toast';
import { Bookmark, Star, Tags, X } from 'lucide-react';

interface BookmarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
  insightContent: any;
  defaultTitle?: string;
}

export const BookmarkDialog: React.FC<BookmarkDialogProps> = ({
  isOpen,
  onClose,
  sectionName,
  insightContent,
  defaultTitle = ''
}) => {
  const { addBookmark } = useBookmarks();
  const { toast } = useToast();
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your bookmark.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const bookmark = await addBookmark(
        sectionName,
        insightContent,
        title.trim(),
        description.trim() || undefined,
        tags
      );

      if (bookmark) {
        toast({
          title: "Bookmark saved!",
          description: "Your insight has been added to your favorites."
        });
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setTags([]);
      }
    } catch (error) {
      toast({
        title: "Failed to save bookmark",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Bookmark Insight
          </DialogTitle>
          <DialogDescription>
            Save this insight to your favorites for quick access later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this insight..."
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a personal note about this insight..."
              className="w-full"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tags className="w-3 h-3" />
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="outline"
                size="sm"
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground mb-1">
              <strong>Section:</strong> {sectionName}
            </p>
            <p className="text-sm text-muted-foreground">
              This will save the current state of your {sectionName} insights.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            <Bookmark className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Bookmark'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};