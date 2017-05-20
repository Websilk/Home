-- =============================================
-- Author:		Mark Entingh
-- Create date: 2:10 pm 3/1/2015
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[Log_GetAnalytics] 
	@websiteId int = 0, 
	@pageId int = 0,
	@countryCode nvarchar(3) = '',
	@agent nvarchar(200) = '',
	@referrer nvarchar(200) = '',
	@logYear int = 2015,
	@logMonth int = 1,
	@logDay int = 0,
	@reexecute bit = 0
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @dateStart datetime
	IF @logDay > 0 BEGIN SET @dateStart = DATEFROMPARTS(@logYear, @logMonth, @logDay) END
	ELSE IF @logMonth > 0 BEGIN SET @dateStart = DATEFROMPARTS(@logYear, @logMonth, 1) END
	ELSE BEGIN SET @dateStart = DATEFROMPARTS(@logYear, 1, 1) END

	-- get cached results
	SELECT * INTO #tbl FROM LogAnalytics 
	WHERE websiteid=@websiteId AND pageid=@pageId  AND countryCode = @countryCode AND agent=@agent AND referrer=@referrer
	AND logYear = @logYear 
	AND logMonth=CASE WHEN @logMonth = 0 THEN logMonth ELSE @logMonth END
	AND logDay=CASE WHEN @logDay = 0 THEN logDay ELSE @logDay END
	

	IF (SELECT COUNT(*) FROM #tbl) > 0 BEGIN
		-- found cached results
		IF @reexecute < 2 BEGIN SELECT * FROM #tbl ORDER BY logYear ASC, logMonth ASC, logDay ASC END
	END ELSE BEGIN
		-- create & cache results

		-- get all records from the log (very dangerous query for memory)
		SELECT * INTO #log FROM [Log] WHERE datecreated >= @dateStart 
		AND datecreated < CASE WHEN @logDay > 0 THEN DATEADD(DAY,1,@dateStart) 
					ELSE CASE WHEN @logMonth > 0 THEN DATEADD(MONTH,1,@dateStart)
					ELSE DATEADD(YEAR,1,@dateStart) END END
		
		DECLARE
			@totalViews int = 0, @totalBots int = 0,
			@totalLoadTime float = 0, @avgLoadTime float = 0, @totalAjax float = 0, 
			@totalVisitors int = 0, @maxVisitorViews int = 0, @avgVisitorViews float = 0,
			@totalUsers int = 0, @maxUserViews int = 0, @avgUserViews float = 0,
			@bounceRate float = 0,
			@totalComponents int = 0, @avgComponents float = 0,
			@totalApps int = 0, @avgApps float = 0,
			@totalInterfaces int = 0, @avgInterfaces float = 0,
			@totalSqlQueries int = 0, @avgSqlQueries float = 0,
			@totalText int = 0, @avgText float = 0,
			@totalPhotos int = 0, @avgPhotos float = 0,
			@totalGalleries int = 0, @avgGalleries float = 0,
			@totalPanels int = 0, @avgPanels float = 0,
			@totalMenus int = 0, @avgMenus float = 0,
			@totalEditor int = 0, @totalDash int = 0
		
		-- get various equation results
		SELECT @totalViews = COUNT(*) FROM #log
		SELECT @totalBots = COUNT(*) FROM #log WHERE agent LIKE '%bot%' OR agent LIKE '%crawl%' OR agent LIKE '%spider%'
		SELECT @totalLoadTime = SUM(loadtime) FROM #log
		IF @totalLoadTime > 0 AND @totalViews > 0 BEGIN SET @avgLoadTime = @totalLoadTime / @totalViews END
		SELECT @totalAjax = COUNT(*) FROM #log WHERE ajax=1
		SELECT @totalVisitors = COUNT(*) FROM (SELECT DISTINCT visitorId FROM #log) AS tbl
		SELECT COUNT(visitorid) AS views INTO #logviews FROM #log GROUP BY visitorid
		SELECT @maxVisitorViews = MAX(views) FROM #logviews
		SELECT @avgVisitorViews = AVG(views) FROM #logviews
		SELECT @totalUsers = COUNT(*) FROM #log WHERE userid IS NOT NULL
		SELECT COUNT(userid) AS views INTO #logusers FROM #log WHERE userid IS NOT NULL GROUP BY userid
		SELECT @maxUserViews = MAX(views) FROM #logusers
		SELECT @avgUserViews = AVG(views) FROM #logusers
		IF @totalVisitors > 0 BEGIN SELECT @bounceRate = (100 / @totalVisitors * COUNT(views)) FROM #logviews WHERE views=1 END
		SELECT @totalComponents = SUM(components),  @avgComponents = AVG(components) FROM #log
		SELECT @totalApps = SUM(apps),  @avgApps = AVG(apps) FROM #log
		SELECT @totalInterfaces = SUM(interfaces),  @avgInterfaces = AVG(interfaces) FROM #log
		SELECT @totalSqlQueries = SUM(sqlqueries),  @avgSqlQueries = AVG(sqlqueries) FROM #log
		SELECT @totalText = SUM(ctext),  @avgText = AVG(ctext) FROM #log
		SELECT @totalPhotos = SUM(cphotos),  @avgPhotos = AVG(cphotos) FROM #log
		SELECT @totalGalleries = SUM(cgalleries),  @avgGalleries = AVG(cgalleries) FROM #log
		SELECT @totalPanels = SUM(cpanels),  @avgPanels = AVG(cpanels) FROM #log
		SELECT @totalMenus = SUM(cmenus),  @avgMenus = AVG(cmenus) FROM #log
		SELECT @totalEditor = COUNT(editor) FROM #log WHERE editor=1
		SELECT @totalDash = COUNT(dash) FROM #log WHERE dash=1

		-- set NULL to 0
		IF (@totalViews       IS NULL) BEGIN SET @totalViews       = 0 END
		IF (@totalBots        IS NULL) BEGIN SET @totalBots        = 0 END
		IF (@totalLoadTime    IS NULL) BEGIN SET @totalLoadTime    = 0 END
		IF (@avgLoadTime      IS NULL) BEGIN SET @avgLoadTime      = 0 END
		IF (@totalAjax        IS NULL) BEGIN SET @totalAjax        = 0 END
		IF (@totalVisitors    IS NULL) BEGIN SET @totalVisitors    = 0 END
		IF (@maxVisitorViews  IS NULL) BEGIN SET @maxVisitorViews  = 0 END
		IF (@avgVisitorViews  IS NULL) BEGIN SET @avgVisitorViews  = 0 END
		IF (@totalUsers     IS NULL) BEGIN SET @totalUsers     = 0 END
		IF (@maxUserViews   IS NULL) BEGIN SET @maxUserViews   = 0 END
		IF (@avgUserViews   IS NULL) BEGIN SET @avgUserViews   = 0 END
		IF (@bounceRate       IS NULL) BEGIN SET @bounceRate       = 0 END
		IF (@totalComponents  IS NULL) BEGIN SET @totalComponents  = 0 END
		IF (@avgComponents    IS NULL) BEGIN SET @avgComponents    = 0 END
		IF (@totalApps        IS NULL) BEGIN SET @totalApps        = 0 END
		IF (@avgApps          IS NULL) BEGIN SET @avgApps          = 0 END
		IF (@totalInterfaces  IS NULL) BEGIN SET @totalInterfaces  = 0 END
		IF (@avgInterfaces    IS NULL) BEGIN SET @avgInterfaces    = 0 END
		IF (@totalSqlQueries  IS NULL) BEGIN SET @totalSqlQueries  = 0 END
		IF (@avgSqlQueries    IS NULL) BEGIN SET @avgSqlQueries    = 0 END
		IF (@totalText        IS NULL) BEGIN SET @totalText        = 0 END
		IF (@avgText          IS NULL) BEGIN SET @avgText          = 0 END
		IF (@totalPhotos      IS NULL) BEGIN SET @totalPhotos      = 0 END
		IF (@avgPhotos        IS NULL) BEGIN SET @avgPhotos        = 0 END
		IF (@totalGalleries   IS NULL) BEGIN SET @totalGalleries   = 0 END
		IF (@avgGalleries     IS NULL) BEGIN SET @avgGalleries     = 0 END
		IF (@totalPanels      IS NULL) BEGIN SET @totalPanels      = 0 END
		IF (@avgPanels        IS NULL) BEGIN SET @avgPanels        = 0 END
		IF (@totalMenus       IS NULL) BEGIN SET @totalMenus       = 0 END
		IF (@avgMenus         IS NULL) BEGIN SET @avgMenus         = 0 END
		IF (@totalEditor      IS NULL) BEGIN SET @totalEditor      = 0 END
		IF (@totalDash        IS NULL) BEGIN SET @totalDash        = 0 END

		-- save all equation results into table record
		INSERT INTO LogAnalytics 
					(websiteid, pageId, countryCode, agent, referrer, logYear, logMonth, logDay, dateModified, totalViews, totalBots, totalLoadTime, avgLoadTime,
					totalAjax, totalVisitors, maxVisitorViews, avgVisitorViews, totalUsers, maxUserViews, avgUserViews, bounceRate, 
					totalComponents, avgComponents, totalApps, avgApps, totalInterfaces, avgInterfaces, totalSqlQueries, avgSqlQueries, 
					totalCtext, avgCtext, totalCphotos, avgCphotos, totalCgalleries, avgCgalleries, totalCpanels, avgCpanels, totalCmenus, avgCmenus,
					totalEditor, totalDash) 
			VALUES (@websiteId, @pageId, @countryCode, @agent, @referrer, @logYear, @logMonth, @logDay, GETDATE(), @totalViews, @totalBots, @totalLoadTime, @avgLoadTime,
					@totalAjax, @totalVisitors, @maxVisitorViews, @avgVisitorViews, @totalUsers, @maxUserViews, @avgUserViews, @bounceRate,
					@totalComponents, @avgComponents, @totalApps, @avgApps, @totalInterfaces, @avgInterfaces, @totalSqlQueries, @avgSqlQueries,
					@totalText, @avgText, @totalPhotos, @avgPhotos, @totalGalleries, @avgGalleries, @totalPanels, @avgPanels, @totalMenus, @avgMenus,
					@totalEditor, @totalDash)

		-- generate results for each day in the month & each month in the year if neccessary
		DECLARE @x int = 0, @days int, @dateTemp datetime
		IF @logMonth = 0 BEGIN 
			-- month isn't provided, get results for every day of the year
			DECLARE @m int = 0, @m2 int = 0, @y2 int = 0
			SET @dateTemp = @dateStart
			WHILE @m <= 12 BEGIN
				SET @dateTemp = DATEADD(month,@m,@dateStart)
				SET @x = 0
				SET @m2 = MONTH(@dateTemp)
				SET @y2 = YEAR(@dateTemp)
				SET @days = DATEDIFF(DAY, @dateTemp, DATEADD(MONTH,1,@dateTemp))
				WHILE @x < @days BEGIN
					SET @x += 1
					EXEC Log_GetAnalytics @websiteId=@websiteId, @pageId=@pageId, @countryCode=@countryCode, @agent=@agent, @referrer=@referrer, @logYear=@y2, @logMonth=@m2 ,@logDay=@x, @reexecute=2
				END
				SET @m += 1
			END
		END ELSE IF @logDay = 0 BEGIN
			-- day isn't provided, get results for every day of the month
			SET @x = 0
			SET @days = DATEDIFF(DAY, @dateStart, DATEADD(MONTH,1,@dateStart))
			WHILE @x < @days BEGIN
				SET @x += 1
				EXEC Log_GetAnalytics @websiteId=@websiteId, @pageId=@pageId, @countryCode=@countryCode, @agent=@agent, @referrer=@referrer, @logYear=@logYear, @logMonth=@logMonth,@logDay=@x, @reexecute=2
			END
		END

		-- reexecute SP to get new results
		IF (@reexecute = 0) BEGIN
			EXEC Log_GetAnalytics @websiteId=@websiteId, @pageId=@pageId, @countryCode=@countryCode, @agent=@agent, @referrer=@referrer, @logYear=@logYear, @logMonth=@logMonth,@logDay=@logDay, @reexecute=1
		END
	END
END
