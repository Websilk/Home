-- =============================================
-- Author:		Mark Entingh
-- Create date: 6/9/2015 3:44 AM
-- Description:	
-- =============================================
CREATE FUNCTION [dbo].[GetPagePath] 
(
	@pageId int
)
RETURNS nvarchar(MAX)
AS
BEGIN
	DECLARE 
		@Result nvarchar(MAX),
		@title nvarchar(250),
		@parentId int = 0

	SELECT @title=title, @parentId=parentId FROM pages WHERE pageid=@pageId 
	
	IF @parentId is not null AND @parentId > 0 BEGIN
		DECLARE @parentTitle nvarchar(250)
		SELECT @parentTitle=title FROM pages WHERE pageId=@parentId 
		SET @Result = dbo.GetPagePath(@parentId) + '/' + @title
	END 
	ELSE BEGIN
		SET @Result = @title
	END

	-- Return the result of the function
	RETURN @Result

END
