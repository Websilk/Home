-- =============================================
-- Author:		Mark Entingh
-- Create date: 9/?/2013
-- Description:	
-- =============================================
CREATE PROCEDURE Security_GetFeature
	@websiteid int = 0, 
	@pageid int = 0,
	@userid int = 0,
	@feature nvarchar(50) = ''
AS
BEGIN
	SET NOCOUNT ON;
	SELECT [security] FROM [Security] WHERE websiteid=@websiteid
	AND pageid = CASE WHEN @pageid > 0 THEN @pageid ELSE pageid END
	AND userid=@userid AND feature=@feature

END
