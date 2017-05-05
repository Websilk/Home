using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Chroniton;

namespace Websilk.Schedule
{
    public class EveryMinute
    {
        private struct saveFile
        {
            public string file;
            public string data;
            public DateTime created;
        }

        public int saveFileInterval = 20;

        //Scheduler that runs once every 1 minute
        public Scheduler scheduleEveryMinute = new Scheduler();

        //scheduler objects to check every 1 minute
        private List<saveFile> scheduleSaveFiles = new List<saveFile>();

        public EveryMinute()
        {
            //start 1 minute interval schedule
            scheduleEveryMinute.Start(60, () => { CheckScheduleEveryMinute(false); });
        }

        private void CheckScheduleEveryMinute(bool force = false)
        {
            //check queue for files to save
            if (scheduleSaveFiles.Count > 0)
            {
                foreach (var f in scheduleSaveFiles)
                {
                    if ((DateTime.Now - f.created).TotalMinutes >= saveFileInterval || force == true)
                    {
                            ProcessScheduleSaveFile(f);
                    }
                }
            }
        }

        private void ProcessScheduleSaveFile(saveFile f)
        {
            if (!Directory.Exists(Path.GetDirectoryName(f.file)))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(f.file));
            }
            File.WriteAllText(f.file, f.data);
            scheduleSaveFiles.Remove(f);
        }

        public void ProcessScheduleSaveFile(string filePath)
        {
            ProcessScheduleSaveFile(GetSaveFile(filePath));
        }

        public void ScheduleSaveFile(string filePath, string data)
        {
            RemoveScheduledSaveFile(filePath);
            scheduleSaveFiles.Add(new saveFile()
            {
                file = filePath,
                data = data,
                created = DateTime.Now
            });
        }

        private int GetSaveFileIndex(string filePath)
        {
            return scheduleSaveFiles.FindIndex(a => a.file == filePath);
        }

        private saveFile GetSaveFile(string filePath)
        {
            var i = GetSaveFileIndex(filePath);
            if (i >= 0)
            {
                return scheduleSaveFiles[i];
            }
            return new saveFile();
        }

        public void ForceScheduleEveryMinuteToUpdate()
        {
            //forces schedule to update content
            CheckScheduleEveryMinute(true);
        }

        public string GetScheduledSaveFileData(string filePath)
        {
            var file = GetSaveFile(filePath);
            return file.data;
        }

        public bool HasScheduledSaveFile(string filePath)
        {
            var file = GetSaveFile(filePath);
            if (file.file == null) { return false; }
            return true;
        }

        public void RemoveScheduledSaveFile(string filePath)
        {
            var i = GetSaveFileIndex(filePath);
            if (i >= 0)
            {
                scheduleSaveFiles.RemoveAt(i);
            }
        }
    }
}
