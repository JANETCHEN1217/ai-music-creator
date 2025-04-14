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
import LyricsIcon from '@mui/icons-material/Description';
import { Howl } from 'howler';
import MusicService from '../services/musicService';
import { useUser } from '../contexts/UserContext';

const Create = () => {
  const { user } = useUser();
  const [mode, setMode] = useState('simple');
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
  const [showLyrics, setShowLyrics] = useState(false);
  const [currentLyrics, setCurrentLyrics] = useState('');
  
  const [availableTags, setAvailableTags] = useState({
    Genre: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk', 'Blues', 'Reggae', 'Metal'],
    Moods: ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Dark', 'Epic', 'Peaceful', 'Angry', 'Mysterious'],
    Voices: ['Male', 'Female', 'Duet', 'Choir', 'Deep', 'High', 'Smooth', 'Raspy'],
    Tempos: ['Slow', 'Medium', 'Fast', 'Very Fast', 'Ballad', 'Dance', 'Groove']
  });

  // Music playback related
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
      
      console.log('Generation result:', result);
      
      if (result.trackId) {
        // Create a placeholder track
        const placeholderTrack = {
          trackId: result.trackId,
          title: songTitle || description || 'New Track',
          status: 'pending',
          coverImage: `https://source.unsplash.com/random/300x300?music&${Date.now()}`,
          timeStamp: new Date().toISOString(),
          generationTime: Math.floor((Date.now() - startTime) / 1000)
        };
        
        setGeneratedTracks(prev => [placeholderTrack, ...prev]);
        
        // Start polling for status
        startStatusPolling(result.trackId);
      } else {
        throw new Error('No trackId returned from generation');
      }
      
      setSuccess(true);
    } catch (error) {
      console.error('Music generation error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Start polling for track status
  const startStatusPolling = (trackId) => {
    console.log('Starting status polling for trackId:', trackId);
    
    // Clear existing polling interval if any
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }
    
    // Define the polling function
    const pollStatus = async () => {
      try {
        console.log('Polling status for trackId:', trackId);
        const status = await MusicService.checkGenerationStatus(trackId);
        console.log('Status response:', status);
        
        // 更详细的日志输出，帮助排查问题
        console.log('Task status:', status.taskStatus);
        console.log('Items array:', status.items);
        
        // 增加详细的响应内容检查
        if (status.rawResponse) {
          console.log('===== 原始响应数据详情 =====');
          console.log('原始响应对象结构:', Object.keys(status.rawResponse));
          console.log('完整响应:', JSON.stringify(status.rawResponse, null, 2));
          
          const items = status.items || [];
          if (items.length > 0) {
            console.log('第一个音乐项详情:');
            const item = items[0];
            console.log('- 项目字段:', Object.keys(item));
            console.log('- 音频URL存在?', Boolean(item.url || item.fileUrl || item.mp3Url || item.clid2AudioUrl));
            console.log('- 具体URL:', item.url || item.fileUrl || item.mp3Url || item.clid2AudioUrl);
            console.log('- 封面图片存在?', Boolean(item.imageUrl || item.coverUrl || item.coverImageUrl || item.clid2ImageUrl));
            console.log('- 歌词存在?', Boolean(item.lyrics));
          } else {
            console.log('响应中没有音乐项目');
          }
        }
        
        // 使用多种可能的状态名称，确保能够正确识别完成状态
        const isCompleted = status.taskStatus === 'success' || 
                            status.taskStatus === 'complete' || 
                            status.status === 'success' || 
                            status.status === 'complete';
                            
        if (isCompleted) {
          // 歌曲生成成功完成
          console.log('音乐生成完成!');
          clearInterval(pollingInterval.current);
          
          // 提取歌曲数据
          let trackData = {
            trackId: trackId,
            title: songTitle || description || '我的歌曲',
            status: 'completed',
          };
          
          // 处理items数组，获取音频URL、封面图片等
          if (status.items && status.items.length > 0) {
            const item = status.items[0]; // 获取第一首歌
            console.log('Processing music item:', item);
            
            // 提取重要字段
            const clipId = item.clipId || '';
            // 尝试从多个可能的字段中获取URL
            const fileUrl = item.url || item.fileUrl || item.mp3Url || item.clid2AudioUrl || '';
            // 尝试从多个可能的字段中获取封面图片
            const coverImage = item.imageUrl || item.coverUrl || item.coverImageUrl || item.clid2ImageUrl || 
                              `https://source.unsplash.com/random/300x300?music&${trackId}`;
            
            trackData = {
              ...trackData,
              clipId, // 保存clipId，用于构建备用URL
              fileUrl,
              coverImage,
              lyrics: item.lyrics || '没有歌词',
              duration: item.duration || 30
            };
            
            // 强制为fileUrl设置一个值，确保播放器可以工作
            if (!trackData.fileUrl) {
              console.log('生成的歌曲没有直接的URL，尝试使用API获取');
              // 如果没有直接的URL，尝试构建一个URL
              trackData.fileUrl = `https://dzwlai.com/apiuser/_open/suno/music/file?clipId=${item.clipId || trackId}`;
            }
            
            console.log('Updated track data:', trackData);
          } else {
            console.warn('响应中没有音乐项目，使用默认值');
            // 即使没有items，也要确保有最低限度的数据可以显示
            trackData.coverImage = `https://source.unsplash.com/random/300x300?music&${trackId}`;
            trackData.fileUrl = `https://dzwlai.com/apiuser/_open/suno/music/file?clipId=${trackId}`;
          }
          
          // 更新生成的歌曲列表
          setGeneratedTracks(prev => {
            const updated = [...prev];
            const index = updated.findIndex(t => t.trackId === trackId);
            
            if (index !== -1) {
              updated[index] = { ...updated[index], ...trackData };
              console.log('Updated track in list:', updated[index]);
            } else {
              console.warn('Track not found in list, adding new one');
              updated.push(trackData);
            }
            
            return updated;
          });
          
          // 如果有URL，自动播放新生成的歌曲
          if (trackData.fileUrl) {
            const updatedTrack = { ...trackData };
            setCurrentTrack(updatedTrack);
            playTrack(updatedTrack);
          } else {
            console.error('Track completed but no file URL available');
            setError('歌曲生成成功，但没有可用的音频URL。请联系支持。');
          }
        } 
        else if (status.taskStatus === 'failed' || status.status === 'failed') {
          // 生成失败
          clearInterval(pollingInterval.current);
          setError('音乐生成失败，请再试一次。');
          
          // 更新歌曲状态
          setGeneratedTracks(prev => {
            const updated = [...prev];
            const index = updated.findIndex(t => t.trackId === trackId);
            
            if (index !== -1) {
              updated[index] = { 
                ...updated[index], 
                status: 'failed' 
              };
            }
            
            return updated;
          });
        }
        // 其他状态(processing, pending)继续轮询
      } catch (error) {
        console.error('Error polling status:', error);
        // 不清除轮询，下次再试
      }
    };
    
    // Poll immediately and then every 3 seconds
    pollStatus();
    pollingInterval.current = setInterval(pollStatus, 3000);
  };
  
  // Playing a track
  const playTrack = (track) => {
    if (!track) {
      console.error('Cannot play track: track is null or undefined');
      setError('无法播放：未提供有效的歌曲');
      return;
    }
    
    if (!track.fileUrl) {
      console.error('Cannot play track: missing URL', track);
      setError('无法播放：歌曲URL不存在');
      
      // 尝试查找或构建URL
      let fallbackUrl = '';
      if (track.trackId) {
        // 优先尝试使用clipId构建URL
        if (track.clipId) {
          fallbackUrl = `https://dzwlai.com/apiuser/_open/suno/music/file?clipId=${track.clipId}`;
        } else {
          fallbackUrl = `https://dzwlai.com/apiuser/_open/suno/music/file?clipId=${track.trackId}`;
        }
        console.log('尝试使用备用URL:', fallbackUrl);
        
        // 使用备用URL更新track
        track = { ...track, fileUrl: fallbackUrl };
      } else {
        return; // 如果无法构建备用URL，则放弃播放
      }
    }
    
    // 实时校正URL格式
    if (track.fileUrl && track.fileUrl.indexOf('https://') === -1) {
      if (track.fileUrl.startsWith('/')) {
        // 相对URL转绝对URL
        const baseUrl = 'https://dzwlai.com/apiuser';
        track.fileUrl = `${baseUrl}${track.fileUrl}`;
      } else {
        // 其他异常情况
        console.log('URL格式不正确，尝试替换:', track.fileUrl);
        track.fileUrl = `https://dzwlai.com/apiuser/_open/suno/music/file?clipId=${track.trackId}`;
      }
    }
    
    console.log('Playing track with URL:', track.fileUrl);
    
    // Stop current playback if any
    if (sound.current) {
      sound.current.stop();
      clearInterval(progressTimer.current);
    }
    
    // Set the current track
    setCurrentTrack(track);
    setCurrentLyrics(track.lyrics || '');
    
    // 显示正在加载
    setLoading(true);
    
    try {
      // Create new Howler sound instance
      sound.current = new Howl({
        src: [track.fileUrl],
        html5: true,
        onload: () => {
          // 音频加载成功
          setLoading(false);
          console.log('音频加载成功，准备播放');
        },
        onplay: () => {
          setIsPlaying(true);
          setLoading(false);
          // Start progress tracking
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
        },
        onloaderror: (id, err) => {
          console.error('Error loading audio:', err);
          setError('无法加载音频文件，可能是URL无效或者跨域限制');
          setLoading(false);
          
          // 尝试使用备用URL
          if (track.trackId && track.fileUrl !== `https://dzwlai.com/apiuser/_open/suno/music/file?clipId=${track.trackId}`) {
            const fallbackUrl = `https://dzwlai.com/apiuser/_open/suno/music/file?clipId=${track.trackId}`;
            console.log('正在尝试备用URL:', fallbackUrl);
            
            // 更新当前track
            const updatedTrack = { ...track, fileUrl: fallbackUrl };
            setCurrentTrack(updatedTrack);
            
            // 延迟一秒后重试播放
            setTimeout(() => {
              playTrack(updatedTrack);
            }, 1000);
          }
        },
        onplayerror: (id, err) => {
          console.error('Error playing audio:', err);
          setError('无法播放音频，请稍后重试');
          setLoading(false);
        }
      });
      
      // Start playback
      sound.current.play();
    } catch (error) {
      console.error('Error in playTrack:', error);
      setError('播放过程中发生错误');
      setLoading(false);
    }
  };
  
  // Pause playback
  const pausePlayback = () => {
    if (sound.current && isPlaying) {
      sound.current.pause();
    }
  };
  
  // Resume playback
  const resumePlayback = () => {
    if (sound.current && !isPlaying) {
      sound.current.play();
    }
  };
  
  // Download the current track
  const downloadTrack = (track) => {
    if (!track || !track.fileUrl) return;
    
    const link = document.createElement('a');
    link.href = track.fileUrl;
    link.download = `${track.title || 'ai-music'}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Toggle lyrics display
  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
  };

  // Clean up on component unmount
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
        {/* Left column - Input area */}
        <Grid item xs={12} md={3} sx={{ height: '100%', overflowY: 'auto', p: 2 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>Create Music</Typography>
            
            {/* Mode selection tabs */}
            <Tabs 
              value={mode} 
              onChange={(e, newValue) => setMode(newValue)}
              variant="fullWidth" 
              sx={{ mb: 3 }}
            >
              <Tab label="Simple Mode" value="simple" />
              <Tab label="Custom Mode" value="custom" />
            </Tabs>
            
            {/* Simple mode form */}
            {mode === 'simple' && (
              <>
                <Typography variant="subtitle1" gutterBottom>Describe your music</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Example: A cheerful summer pop song with bright guitars and upbeat rhythm"
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
                  label="Instrumental (No vocals)"
                  sx={{ mb: 2, display: 'block' }}
                />
              </>
            )}
            
            {/* Custom mode form */}
            {mode === 'custom' && (
              <>
                <Typography variant="subtitle1" gutterBottom>Lyrics</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Enter lyrics or song description..."
                  value={songLyrics}
                  onChange={(e) => setSongLyrics(e.target.value)}
                  sx={{ mb: 3 }}
                />
                
                <Typography variant="subtitle1" gutterBottom>Music Style</Typography>
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
                
                <Typography variant="subtitle1" gutterBottom>Mood</Typography>
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
                  label="Instrumental (No vocals)"
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
              {loading ? 'Generating...' : 'Generate Music'}
            </Button>
          </Paper>
        </Grid>
        
        {/* Middle column - Player area */}
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
                {/* Track info and cover */}
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
                    <Typography variant="h6">{currentTrack.title || 'Untitled Music'}</Typography>
                  </Box>
                </Box>
                
                {/* Player controls */}
                <Box sx={{ width: '100%', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {formatTime(trackProgress)}
                    </Typography>
                    <Slider
                      value={trackProgress}
                      max={currentTrack.duration || 30}
                      onChange={(e, newValue) => {
                        if (sound.current) {
                          sound.current.seek(newValue);
                          setTrackProgress(newValue);
                        }
                      }}
                      sx={{ flexGrow: 1, mx: 1 }}
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {formatTime(currentTrack.duration || 30)}
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
                    <IconButton onClick={() => downloadTrack(currentTrack)}>
                      <DownloadIcon />
                    </IconButton>
                    <IconButton onClick={toggleLyrics} color={showLyrics ? "primary" : "default"}>
                      <LyricsIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                {/* Lyrics display */}
                {showLyrics && currentLyrics && (
                  <Box sx={{ 
                    width: '100%', 
                    p: 2, 
                    bgcolor: 'background.paper', 
                    borderRadius: 1,
                    maxHeight: 200,
                    overflowY: 'auto',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}>
                    <Typography variant="subtitle2" gutterBottom>Lyrics</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {currentLyrics}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              // No track selected state
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <MusicNoteIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {loading ? 'Generating your music...' : 'Please create or select a track'}
                </Typography>
                {loading && (
                  <CircularProgress sx={{ mt: 3 }} />
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Right column - Music list */}
        <Grid item xs={12} md={3} sx={{ height: '100%', overflowY: 'auto', p: 2 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>My Music</Typography>
            
            {generatedTracks.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No tracks generated yet
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
                      boxShadow: currentTrack?.trackId === track.trackId ? '0 0 0 2px #1976d2' : 'none',
                      opacity: track.status === 'pending' ? 0.7 : 1
                    }}
                    onClick={() => track.status === 'completed' && playTrack(track)}
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
                        {track.status === 'completed' ? 
                          formatTime(track.duration || 30) : 
                          track.status === 'failed' ? 
                            'Generation failed' : 
                            `Generating... ${track.generationTime || generationTime}s`
                        }
                      </Typography>
                    </CardContent>
                    <CardActions>
                      {track.status === 'completed' ? (
                        <>
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            currentTrack?.trackId === track.trackId && isPlaying ? pausePlayback() : playTrack(track);
                          }}>
                            {currentTrack?.trackId === track.trackId && isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                          </IconButton>
                          
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            downloadTrack(track);
                          }}>
                            <DownloadIcon />
                          </IconButton>
                        </>
                      ) : track.status === 'pending' ? (
                        <CircularProgress size={24} sx={{ mx: 1 }} />
                      ) : (
                        <Typography variant="caption" color="error">
                          Failed
                        </Typography>
                      )}
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
        message="Music generation started successfully!"
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