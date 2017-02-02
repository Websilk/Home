-- =============================================
-- Author:		Mark Entingh
-- Create date: 4/13/2014 1:40 pm
-- Description:	rename the title of a website
-- =============================================
CREATE PROCEDURE [dbo].[UpdateWebsiteTitle]
	@websiteId int = 0, 
	@ownerId int = 0,
	@newName nvarchar(50) = ''
AS
BEGIN
	SET NOCOUNT ON;

    DECLARE @X xml,
	@page nvarchar(100),
	@pageId int,
	@myxml nvarchar(200)

	DECLARE @cursor CURSOR

	SET @cursor = CURSOR FOR
	SELECT pageid, title FROM pages WHERE websiteid=@websiteId AND ownerId=@ownerId 
	OPEN @cursor
	FETCH NEXT FROM @cursor INTO @pageId, @page
	WHILE @@FETCH_STATUS = 0
	BEGIN
		SET @myxml = '<root><w><![CDATA[' + REPLACE(@page,' - ',']]></w><p><![CDATA[') + ']]></p></root>'
		SELECT @X = CONVERT(xml,@myxml)
		UPDATE pages SET title=@newName + ' - ' + (SELECT [Value] = T.c.value('.','varchar(100)')
		FROM @X.nodes('/root/p') T(c))
		WHERE pageid=@pageId

	FETCH NEXT FROM @cursor INTO @pageId, @page
	END
	CLOSE @cursor
	DEALLOCATE @cursor

	update websites SET title=@newName WHERE websiteid=@websiteId AND ownerId=@ownerId


	
END
