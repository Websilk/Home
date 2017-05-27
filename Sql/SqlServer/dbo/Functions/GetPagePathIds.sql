-- =============================================
-- Author:		Mark Entingh
-- Create date: 6/9/2015 11:42 PM
-- Description:	
-- =============================================
CREATE FUNCTION [dbo].[GetPagePathIds] 
(
	@pageId int
)
RETURNS nvarchar(MAX)
AS
BEGIN
	DECLARE 
		@Result nvarchar(MAX),
		@parentId int = 0

	SELECT @parentId=parentId FROM Pages WHERE pageId=@pageId 
	
	IF @parentId IS NOT NULL AND @parentId > 0 BEGIN
		SET @Result = dbo.GetPagePathIds(@parentId) + '/' + CONVERT(nvarchar(MAX), @pageId)
	END 
	ELSE BEGIN
		SET @Result = CONVERT(nvarchar(MAX), @pageId)
	END

	-- Return the result of the function
	RETURN @Result

END
