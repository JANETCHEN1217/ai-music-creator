import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  Stack,
  Chip,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
  CircularProgress,
  Alert,
  ButtonGroup,
  Slider,
  Snackbar,
  Grid,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Tabs,
  Tab,
  CardMedia,
  CardActions,
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { Howl } from 'howler';
import MusicService from '../services/musicService';
import { useUser } from '../contexts/UserContext';

const Create = () => {
  const { user } = useUser();
  const [mode, setMode] = useState('custom');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songStyle, setSongStyle] = useState([]);
  const [songLyrics, setSongLyrics] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [description, setDescription] = useState('');
  const [activeCategory, setActiveCategory] = useState('Genre');
  const [showAllTags, setShowAllTags] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState([]);
  const [duration, setDuration] = useState(30);
  const [generationTime, setGenerationTime] = useState(0);
  const [availableTags, setAvailableTags] = useState({
    Genre: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
    Moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
    Voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
    Tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
  });

  // 音乐播放相关
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);
  const sound = useRef(null);
  const progressTimer = useRef(null);
  const pollingInterval = useRef(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tags = await MusicService.getTags();
      setAvailableTags({
        Genre: tags.genres || [],
        Moods: tags.moods || [],
        Voices: tags.voices || [],
        Tempos: tags.tempos || []
      });
    } catch (error) {
      console.error('Error loading tags:', error);
      setError('Failed to load music tags');
    }
  };

  const handleTagClick = (tag) => {
    if (songStyle.includes(tag)) {
      setSongStyle(songStyle.filter(t => t !== tag));
    } else {
      setSongStyle([...songStyle, tag]);
    }
  };

  const getVisibleTags = () => {
    const tags = availableTags[activeCategory] || [];
    return activeCategory === 'Genre' && !showAllTags ? tags.slice(0, 12) : tags;
  };

  const handleDurationChange = (event, newValue) => {
    setDuration(newValue);
  };

  const handleGenerateMusic = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setGenerationTime(0);
    
    try {
      // Check if user is authenticated
      if (!user) {
        throw new Error('Please sign in to generate music');
      }

      const startTime = Date.now();
      const timer = setInterval(() => {
        setGenerationTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      const result = await MusicService.generateTrack({
        mode: mode,
        description: description || "Happy music",
        style: songStyle.length > 0 ? songStyle : songTitle,
        lyrics: songLyrics,
        isInstrumental: isInstrumental,
        duration: 30
      });

      clearInterval(timer);

      // Create cover image for the track
      const coverImage = `https://source.unsplash.com/300x300/?${encodeURIComponent(songTitle || description || 'music')}`;
      
      const newTrack = {
        ...result,
        title: songTitle || description || 'My Song',
        coverImage,
        timeStamp: new Date().toISOString(),
        generationTime: Math.floor((Date.now() - startTime) / 1000)
      };

      setGeneratedTracks([newTrack, ...generatedTracks]);
      setSuccess(true);
      
      // Poll for status if the generation is not immediate
      if (result.status === 'pending') {
        const checkStatus = async () => {
          try {
            const status = await MusicService.checkGenerationStatus(result.trackId);
            if (status.status === 'completed') {
              setGeneratedTracks(prev => {
                const updatedTracks = [...prev];
                const index = updatedTracks.findIndex(t => t.trackId === result.trackId);
                if (index !== -1) {
                  updatedTracks[index] = {
                    ...updatedTracks[index],
                    ...status,
                    status: 'completed'
                  };
                }
                return updatedTracks;
              });
            } else if (status.status === 'failed') {
              setError('Music generation failed. Please try again.');
              setGeneratedTracks(prev => {
                const updatedTracks = [...prev];
                const index = updatedTracks.findIndex(t => t.trackId === result.trackId);
                if (index !== -1) {
                  updatedTracks[index] = {
                    ...updatedTracks[index],
                    status: 'failed'
                  };
                }
                return updatedTracks;
              });
            } else {
              setTimeout(checkStatus, 5000); // Check again in 5 seconds
            }
          } catch (error) {
            console.error('Error checking status:', error);
          }
        };
        checkStatus();
      }
    } catch (error) {
      console.error('Music generation error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Getting track cover image based on title/description
  const getTrackCoverImage = (title, description) => {
    return `https://source.unsplash.com/300x300/?${encodeURIComponent(title || description || 'music')}`;
  };

  // 播放音乐
  const playTrack = (track) => {
    if (sound.current) {
      sound.current.stop();
      clearInterval(progressTimer.current);
    }
    
    if (!track || !track.fileUrl) return;
    
    // 设置当前播放音乐
    setCurrentTrack(track);
    
    // 创建Howler实例
    sound.current = new Howl({
      src: [track.fileUrl],
      html5: true,
      onplay: () => {
        setIsPlaying(true);
        // 启动进度条定时器
        progressTimer.current = setInterval(() => {
          setTrackProgress(sound.current.seek());
        }, 1000);
      },
      onpause: () => {
        setIsPlaying(false);
        clearInterval(progressTimer.current);
      },
      onstop: () => {
        setIsPlaying(false);
        setTrackProgress(0);
        clearInterval(progressTimer.current);
      },
      onend: () => {
        setIsPlaying(false);
        setTrackProgress(0);
        clearInterval(progressTimer.current);
      }
    });
    
    sound.current.play();
  };
  
  // 暂停播放
  const pausePlayback = () => {
    if (sound.current && isPlaying) {
      sound.current.pause();
    }
  };
  
  // 继续播放
  const resumePlayback = () => {
    if (sound.current && !isPlaying) {
      sound.current.play();
    }
  };

  // 清理组件卸载时的副作用
  useEffect(() => {
    return () => {
      if (sound.current) {
        sound.current.stop();
      }
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  return (
    <Box sx={{ flexGrow: 1, height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* 左侧输入区域 */}
        <Grid item xs={12} md={3} sx={{ height: '100%', overflowY: 'auto', p: 2 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>创建音乐</Typography>
            
            {/* 模式选择标签页 */}
            <Tabs 
              value={mode} 
              onChange={(e, newValue) => setMode(newValue)}
              variant="fullWidth" 
              sx={{ mb: 3 }}
            >
              <Tab label="简单模式" value="simple" />
              <Tab label="自定义模式" value="custom" />
            </Tabs>
            
            {/* 简单模式表单 */}
            {mode === 'simple' && (
              <>
                <Typography variant="subtitle1" gutterBottom>描述你想要的音乐</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="例如：一首轻快的夏日流行歌曲，带有明亮的吉他和欢快的节奏"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{ mb: 3 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={isInstrumental}
                      onChange={(e) => setIsInstrumental(e.target.checked)}
                    />
                  }
                  label="纯音乐（无人声）"
                  sx={{ mb: 2, display: 'block' }}
                />
              </>
            )}
            
            {/* 自定义模式表单 */}
            {mode === 'custom' && (
              <>
                <Typography variant="subtitle1" gutterBottom>歌词内容</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="输入歌词或歌曲描述..."
                  value={songLyrics}
                  onChange={(e) => setSongLyrics(e.target.value)}
                  sx={{ mb: 3 }}
                />
                
                <Typography variant="subtitle1" gutterBottom>音乐风格</Typography>
                <Box sx={{ mb: 3 }}>
                  {availableTags.Genre.slice(0, 8).map(style => (
                    <Chip
                      key={style}
                      label={style}
                      onClick={() => handleTagClick(style)}
                      color={songStyle.includes(style) ? "primary" : "default"}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>情绪</Typography>
                <Box sx={{ mb: 3 }}>
                  {availableTags.Moods.slice(0, 6).map(mood => (
                    <Chip
                      key={mood}
                      label={mood}
                      onClick={() => handleTagClick(mood)}
                      color={songStyle.includes(mood) ? "primary" : "default"}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={isInstrumental}
                      onChange={(e) => setIsInstrumental(e.target.checked)}
                    />
                  }
                  label="纯音乐（无人声）"
                  sx={{ mb: 2, display: 'block' }}
                />
              </>
            )}
            
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleGenerateMusic}
              disabled={loading || (mode === 'simple' && !description) || (mode === 'custom' && !songLyrics)}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MusicNoteIcon />}
              sx={{ mt: 2 }}
            >
              {loading ? '生成中...' : '生成音乐'}
            </Button>
          </Paper>
        </Grid>
        
        {/* 中间播放区域 */}
        <Grid item xs={12} md={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Paper 
            sx={{ 
              p: 3, 
              width: '100%', 
              maxWidth: 600,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', 
              minHeight: 400,
              mb: 2
            }}
          >
            {currentTrack ? (
              <>
                {/* 曲目信息和封面 */}
                <Box 
                  sx={{
                    width: '100%',
                    height: 300,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    backgroundImage: currentTrack.coverImage ? `url(${currentTrack.coverImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    mb: 2,
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', borderRadius: '0 0 8px 8px' }}>
                    <Typography variant="h6">{currentTrack.title || '未命名音乐'}</Typography>
                  </Box>
                </Box>
                
                {/* 播放控制 */}
                <Box sx={{ width: '100%', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {trackProgress.toFixed(2)}
                    </Typography>
                    <Slider
                      value={trackProgress}
                      max={duration}
                      onChange={(e, newValue) => {
                        if (sound.current) {
                          sound.current.seek(newValue);
                          setTrackProgress(newValue);
                        }
                      }}
                      sx={{ flexGrow: 1, mx: 1 }}
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {duration.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {isPlaying ? (
                      <IconButton onClick={pausePlayback} size="large">
                        <PauseIcon fontSize="large" />
                      </IconButton>
                    ) : (
                      <IconButton onClick={resumePlayback} size="large">
                        <PlayArrowIcon fontSize="large" />
                      </IconButton>
                    )}
                    <IconButton>
                      <DownloadIcon />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              // 未选择曲目时的提示
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <MusicNoteIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {loading ? '正在生成您的音乐...' : '请创建或选择一首音乐'}
                </Typography>
                {loading && (
                  <CircularProgress sx={{ mt: 3 }} />
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* 右侧音乐列表 */}
        <Grid item xs={12} md={3} sx={{ height: '100%', overflowY: 'auto', p: 2 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>我的音乐</Typography>
            
            {generatedTracks.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  还没有生成的音乐
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {generatedTracks.map((track) => (
                  <Card 
                    key={track.trackId} 
                    sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      boxShadow: currentTrack?.trackId === track.trackId ? '0 0 0 2px #1976d2' : 'none' 
                    }}
                    onClick={() => playTrack(track)}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={track.coverImage || `https://source.unsplash.com/random/300x200?music&${track.trackId}`}
                      alt={track.title}
                    />
                    <CardContent sx={{ pb: 1 }}>
                      <Typography variant="subtitle1" noWrap>{track.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {track.status === 'completed' ? '1m 35s' : `${track.generationTime || generationTime}s`}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <IconButton size="small" onClick={(e) => {
                        e.stopPropagation();
                        currentTrack?.trackId === track.trackId && isPlaying ? pausePlayback() : playTrack(track);
                      }}>
                        {currentTrack?.trackId === track.trackId && isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                      </IconButton>
                      
                      <IconButton size="small">
                        <DownloadIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
        action={
          <IconButton size="small" color="inherit" onClick={() => setError(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        message="Song generated successfully!"
        action={
          <IconButton size="small" color="inherit" onClick={() => setSuccess(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default Create;