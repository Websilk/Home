using System;

using Chroniton;
using Chroniton.Jobs;
using Chroniton.Schedules;

namespace Websilk
{
    public class Scheduler
    {
        //Scheduling service (like CRON jobs)
        private Core S;
        private Singularity singularity = Singularity.Instance;
        private EveryXTimeSchedule schedule;
        private SimpleParameterizedJob<string> job;
        private IScheduledJob scheduledJob;

        public Scheduler(){ }

        public void Start(int seconds, Action method) {
            if (singularity.IsStarted) { return; }
            job = new SimpleParameterizedJob<string>((parameter, scheduledTime) =>
            {
                //job execution
                method();
            });

            //set up job schedule (every 3 seconds)
            schedule = new EveryXTimeSchedule(TimeSpan.FromSeconds(seconds));
            scheduledJob = singularity.ScheduleParameterizedJob(schedule, job, null, true);

            //run job
            singularity.Start();
        }

        public void Stop()
        {
            try { singularity.StopScheduledJob(scheduledJob);  singularity.Stop(); } catch (Exception) { }
        }
    }
}
