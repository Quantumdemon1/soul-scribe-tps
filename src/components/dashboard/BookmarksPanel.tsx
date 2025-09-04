import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useBookmarks, Bookmark } from '@/hooks/useBookmarks';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  Search, 
  Filter, 
  Download, 
  Share2, 
  Trash2, 
  Edit3,
  Calendar,
  Tags,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface BookmarksPanelProps {
  currentSection?: string;
}

export const BookmarksPanel: React.FC<BookmarksPanelProps> = ({ currentSection }) => {
  const { bookmarks, loading, removeBookmark } = useBookmarks();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState<string>('all');

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSection = filterSection === 'all' || bookmark.section_name === filterSection;
    
    return matchesSearch && matchesSection;
  });

  const sectionCounts = bookmarks.reduce((acc, bookmark) => {
    acc[bookmark.section_name] = (acc[bookmark.section_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleExportBookmark = (bookmark: Bookmark) => {
    const exportData = {
      title: bookmark.title,
      description: bookmark.description,
      section: bookmark.section_name,
      tags: bookmark.tags,
      content: bookmark.insight_content,
      savedAt: bookmark.created_at
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `bookmark-${bookmark.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  };

  const handleShareBookmark = async (bookmark: Bookmark) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: bookmark.title,
          text: bookmark.description || 'Check out this personality insight!',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      const shareText = `${bookmark.title}\n\n${bookmark.description || ''}\n\nFrom: ${bookmark.section_name}`;
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard",
        description: "Bookmark details copied to clipboard."
      });
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    const success = await removeBookmark(bookmarkId);
    if (success) {
      toast({
        title: "Bookmark deleted",
        description: "Bookmark has been removed from your favorites."
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading bookmarks...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Your Bookmarked Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bookmarks..."
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {filterSection === 'all' ? 'All Sections' : filterSection}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Section</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterSection('all')}>
                  All Sections ({bookmarks.length})
                </DropdownMenuItem>
                {Object.entries(sectionCounts).map(([section, count]) => (
                  <DropdownMenuItem key={section} onClick={() => setFilterSection(section)}>
                    {section} ({count})
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Summary Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{bookmarks.length} total bookmarks</span>
            <span>•</span>
            <span>{Object.keys(sectionCounts).length} sections</span>
            <span>•</span>
            <span>{filteredBookmarks.length} showing</span>
          </div>
        </CardContent>
      </Card>

      {/* Bookmarks List */}
      {filteredBookmarks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookmarks found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterSection !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Start bookmarking insights to build your personal collection.'}
            </p>
            {searchTerm || filterSection !== 'all' ? (
              <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterSection('all'); }}>
                Clear Filters
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBookmarks.map((bookmark) => (
            <Card key={bookmark.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{bookmark.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{bookmark.section_name}</span>
                      <span>•</span>
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(bookmark.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExportBookmark(bookmark)}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShareBookmark(bookmark)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookmark.description && (
                  <p className="text-sm text-muted-foreground">{bookmark.description}</p>
                )}
                
                {bookmark.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tags className="w-4 h-4 text-muted-foreground" />
                    {bookmark.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};