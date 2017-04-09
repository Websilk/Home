CREATE PROCEDURE [dbo].[SearchDocumentation]
	@keywords nvarchar(MAX),
	@andor bit = 0
AS
	DECLARE @cursor CURSOR, @sql nvarchar(MAX), @word nvarchar(50), @started bit = 0
	SELECT * INTO #words FROM dbo.SplitArray(@keywords, ' ')
	
	SET @sql = 'SELECT * FROM Documentation WHERE '
	SET @cursor = CURSOR FOR
	SELECT [value] FROM #words
	OPEN @cursor
	FETCH FROM @cursor INTO @word
	WHILE @@FETCH_STATUS = 0 BEGIN
		IF @started = 1 BEGIN SET @sql = @sql + CASE WHEN @andor = 0 THEN 'AND ' ELSE 'OR ' END END
		SET @sql = @sql + 'keywords LIKE ''%' + @word + '%'' '
		FETCH FROM @cursor INTO @word
	END
	CLOSE @cursor
	DEALLOCATE @cursor
	SET @sql =  @sql + 'ORDER BY LEN([path]) DESC'

	EXECUTE sp_executesql @sql